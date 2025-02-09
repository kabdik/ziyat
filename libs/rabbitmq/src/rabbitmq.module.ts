import {
  DynamicModule,
  Inject,
  Module,
  OnApplicationBootstrap,
  OnApplicationShutdown,
  Provider,
} from '@nestjs/common';
import { MetadataScanner } from '@nestjs/core';
import { AmqpConnectionManager } from 'amqp-connection-manager';

import { AppLoggerService, LoggerModule } from '@/libs/logger';

import { ExplorerService } from './explorer.service';
import {
  amqpConnectionProvider,
  channelWrappersProvider,
  defaultChannelWrapperProvider,
  mergedOptionsProvider,
} from './providers';
import { RabbitMQClient } from './rabbitmq-client';
import { RabbitMQInfraService } from './rabbitmq-infra.service';
import { AMQP_CONNECTION_MANAGER_TOKEN, RABBIT_MODULE_OPTIONS_TOKEN } from './rabbitmq.di-tokens';
import { RabbitMQModuleOptions } from './types';

@Module({
  imports: [LoggerModule],
})
export class RabbitMQModule implements OnApplicationBootstrap, OnApplicationShutdown {
  constructor(
    private readonly explorer: ExplorerService,
    private readonly rabbitMqClient: RabbitMQClient,
    private readonly rabbitMqInfra: RabbitMQInfraService,
    private readonly logger: AppLoggerService,
    @Inject(AMQP_CONNECTION_MANAGER_TOKEN)
    private readonly amqpConnectionManager: AmqpConnectionManager,
  ) {}

  static forRoot(options: RabbitMQModuleOptions): DynamicModule {
    const providers: Provider[] = [
      RabbitMQClient,
      ExplorerService,
      RabbitMQInfraService,
      MetadataScanner,
      {
        provide: RABBIT_MODULE_OPTIONS_TOKEN,
        useValue: options,
      },
      mergedOptionsProvider,
      amqpConnectionProvider,
      channelWrappersProvider,
      defaultChannelWrapperProvider,
    ];

    return {
      providers,
      exports: [RabbitMQClient],
      module: RabbitMQModule,
    };
  }

  async onApplicationShutdown() {
    this.logger.info('Closing AMQP Connections');

    await this.amqpConnectionManager.close();
  }

  public async onApplicationBootstrap() {
    const subscribers = this.explorer.getSubscribers();

    await this.rabbitMqInfra.setupExchanges(subscribers);

    await Promise.all(
      subscribers.map(async (subscriber) =>
        this.rabbitMqClient.createSubscriber(
          subscriber.handler,
          subscriber.options,
          subscriber.handler.name,
        ),
      ),
    );
  }
}
