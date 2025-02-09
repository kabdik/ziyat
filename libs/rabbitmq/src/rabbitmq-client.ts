import { Inject, Injectable } from '@nestjs/common';
import { AmqpConnectionManager, ChannelWrapper } from 'amqp-connection-manager';
import { ConfirmChannel, ConsumeMessage, Options, Replies } from 'amqplib';
import { isNull } from 'lodash';

import { AppLoggerService } from '@/libs/logger';

import {
  AMQP_CONNECTION_MANAGER_TOKEN,
  RABBIT_CHANNEL_WRAPPERS_TOKEN,
  RABBIT_DEFAULT_CHANNEL_WRAPPER_TOKEN,
} from './rabbitmq.di-tokens';
import { RabbitMQInvalidChannelError, RabbitMQInvalidMessageError } from './rabbitmq.errors';
import { SubscriberOptions } from './types';

export type SubscriberHandler<T = unknown> = (
  message: T | undefined,
  rawMessage?: ConsumeMessage,
  headers?: any,
) => Promise<any>;

@Injectable()
export class RabbitMQClient {
  constructor(
    @Inject(AMQP_CONNECTION_MANAGER_TOKEN)
    private readonly amqpConnection: AmqpConnectionManager,
    @Inject(RABBIT_CHANNEL_WRAPPERS_TOKEN)
    private readonly channelWrappers: Record<string, ChannelWrapper>,
    @Inject(RABBIT_DEFAULT_CHANNEL_WRAPPER_TOKEN)
    private readonly defaultChannelWrapper: ChannelWrapper,
    private readonly logger: AppLoggerService,
  ) {}

  public isHealthy() {
    return this.amqpConnection.isConnected();
  }

  public async publish<T = any>(
    exchange: string,
    routingKey: string,
    message: T,
    options?: Options.Publish,
  ): Promise<Replies.Empty> {
    let buffer: Buffer;
    if (message instanceof Buffer) {
      buffer = message;
    } else if (message instanceof Uint8Array) {
      buffer = Buffer.from(message);
    } else if (message != null) {
      buffer = this.serializeMessage(message);
    } else {
      buffer = Buffer.alloc(0);
    }

    return this.defaultChannelWrapper.publish(exchange, routingKey, buffer, options);
  }

  public async createSubscriber<T>(
    handler: SubscriberHandler<T>,
    subscriberOptions: SubscriberOptions,
    originalHandlerName: string,
  ): Promise<void> {
    const channelWrapper = subscriberOptions.queueOptions?.channel
      ? this.getChannelWrapper(subscriberOptions.queueOptions?.channel)
      : this.defaultChannelWrapper;

    await this.createChannelSubscriber(
      channelWrapper,
      handler,
      subscriberOptions,
      originalHandlerName,
    );

    this.logger.info(
      `Handler ${originalHandlerName} subscribed to ${subscriberOptions.exchange}::${subscriberOptions.routingKey}::${subscriberOptions.queue}`,
    );
  }

  private async createChannelSubscriber<T>(
    channelWrapper: ChannelWrapper,
    handler: SubscriberHandler<T>,
    subscriberOptions: SubscriberOptions,
    originalHandlerName: string,
  ) {
    await new Promise<void>((resolve) => {
      void channelWrapper.addSetup(async (channel: ConfirmChannel) =>
        channel.consume(subscriberOptions.queue, async (message) => {
          try {
            if (isNull(message)) {
              throw new RabbitMQInvalidMessageError('Received null message');
            }

            await this.handleMessage(handler, message, subscriberOptions.allowNonJsonMessages);

            channelWrapper.ack(message);
          } catch (err) {
            this.logger.error(
              `Error handling message. Handler - ${originalHandlerName} on queue ${subscriberOptions.queue} and channel ${channelWrapper.name}`,
              err,
            );

            if (subscriberOptions.errorHandler) {
              await subscriberOptions.errorHandler(channel, message, err);
              return;
            }

            channelWrapper.nack(message, false, false);
          }
        }),
      );
      resolve();
    });
  }

  private async handleMessage<T>(
    handler: SubscriberHandler<T>,
    message: ConsumeMessage,
    allowNonJsonMessages: boolean,
  ) {
    let headers: any;

    const messageContent = this.deserializeMessage(message.content, allowNonJsonMessages) as T;

    if (message.properties?.headers) {
      headers = message.properties.headers;
    }

    return handler(messageContent, message, headers);
  }

  private deserializeMessage(message: Buffer, allowNonJsonMessages: boolean) {
    try {
      return JSON.parse(message.toString());
    } catch (err) {
      if (allowNonJsonMessages) {
        return message.toString();
      }
      throw new RabbitMQInvalidMessageError(`Error parsing message ${err}`);
    }
  }

  private serializeMessage(message: any) {
    return Buffer.from(JSON.stringify(message));
  }

  private getChannelWrapper(channel: string) {
    const channelWrapper = this.channelWrappers[channel];

    if (!channelWrapper) {
      throw new RabbitMQInvalidChannelError(`Channel ${channel} does not exist`);
    }

    return channelWrapper;
  }
}
