import { Provider } from '@nestjs/common';
import { AmqpConnectionManager, connect } from 'amqp-connection-manager';
import { ConfirmChannel } from 'amqplib';

import { AppLoggerService } from '@/libs/logger';

import {
  AMQP_CONNECTION_MANAGER_TOKEN,
  RABBIT_CHANNEL_WRAPPERS_TOKEN,
  RABBIT_DEFAULT_CHANNEL_WRAPPER_TOKEN,
  RABBIT_MERGED_MODULE_OPTIONS_TOKEN,
  RABBIT_MODULE_OPTIONS_TOKEN,
} from './rabbitmq.di-tokens';
import { RabbitMQConfigError, RabbitMQConnectionError } from './rabbitmq.errors';
import {
  ChannelWrappers,
  RabbitMQChannelOptions,
  RabbitMQMergedModuleOptions,
  RabbitMQModuleOptions,
} from './types';

const defaultChannel: Required<RabbitMQChannelOptions> = {
  prefetchCount: 10,
  name: 'default',
  default: true,
};

const defaultOptions = {
  timeout: 5000,
  channels: [defaultChannel],
  prefetchCount: 10,
} satisfies Partial<RabbitMQModuleOptions>;

export const mergedOptionsProvider: Provider = {
  provide: RABBIT_MERGED_MODULE_OPTIONS_TOKEN,
  useFactory: (options: RabbitMQModuleOptions) =>
    ({
      ...defaultOptions,
      ...options,
    }) satisfies RabbitMQMergedModuleOptions,
  inject: [RABBIT_MODULE_OPTIONS_TOKEN],
};

export const amqpConnectionProvider: Provider = {
  provide: AMQP_CONNECTION_MANAGER_TOKEN,
  useFactory: async (options: RabbitMQMergedModuleOptions, logger: AppLoggerService) => {
    try {
      // TODO[IMPROVEMENT]: add manager options as second argument
      const connection = connect(options.uri);
      await connection.connect({ timeout: 5000 });

      logger.info('Successfully connected to RabbitMQ broker');

      return connection;
    } catch (err) {
      logger.error('Failed to connect to a RabbitMQ broker', err);
      throw err;
    }
  },
  inject: [RABBIT_MERGED_MODULE_OPTIONS_TOKEN, AppLoggerService],
};

export const defaultChannelWrapperProvider: Provider = {
  provide: RABBIT_DEFAULT_CHANNEL_WRAPPER_TOKEN,
  useFactory: (channelWrappers: ChannelWrappers, options: RabbitMQMergedModuleOptions) => {
    const defaultChannelName = options.channels.find((channel) => channel.default).name;

    return Object.values(channelWrappers).find(({ name }) => name === defaultChannelName);
  },
  inject: [RABBIT_CHANNEL_WRAPPERS_TOKEN, RABBIT_MERGED_MODULE_OPTIONS_TOKEN],
};

export const channelWrappersProvider: Provider = {
  provide: RABBIT_CHANNEL_WRAPPERS_TOKEN,
  useFactory: async (
    connectionManager: AmqpConnectionManager,
    options: RabbitMQMergedModuleOptions,
    logger: AppLoggerService,
  ) => {
    const { channels } = options;

    const channelWrapperMap: ChannelWrappers = {};

    const defaultChannelCount = countDefaultChannels(channels);

    if (!channels.length) {
      throw new RabbitMQConfigError('Channels must be provided');
    }

    if (defaultChannelCount === 0) {
      throw new RabbitMQConfigError('Default channel must be provided');
    }

    if (defaultChannelCount > 1) {
      throw new RabbitMQConfigError('Only 1 default channel must be provided');
    }

    const setupChannelPromises = channels.map(async (channelOptions) => {
      channelWrapperMap[channelOptions.name] = await setupChannel(
        connectionManager,
        {
          ...channelOptions,
          prefetchCount: options.prefetchCount,
        },
        logger,
      );
    });

    await Promise.all(setupChannelPromises);

    return channelWrapperMap;
  },
  inject: [AMQP_CONNECTION_MANAGER_TOKEN, RABBIT_MERGED_MODULE_OPTIONS_TOKEN, AppLoggerService],
};

const setupChannel = async (
  connectionManager: AmqpConnectionManager,
  options: Required<Pick<RabbitMQChannelOptions, 'name' | 'prefetchCount'>>,
  logger: AppLoggerService,
) => {
  const channelWrapper = connectionManager.createChannel({
    name: options.name,
  });

  await channelWrapper.waitForConnect((err) => {
    if (err) {
      logger.error(`Error connecting to channel ${options.name}`, err);
      throw new RabbitMQConnectionError(`Error connecting to channel ${options.name}`);
    }
  });

  await new Promise<void>((resolve) => {
    void channelWrapper.addSetup(async (channel: ConfirmChannel) => {
      await channel.prefetch(options.prefetchCount);
      resolve();
    });
  });

  return channelWrapper;
};

const countDefaultChannels = (channels: RabbitMQChannelOptions[]) =>
  channels.filter((channel) => channel.default).length;
