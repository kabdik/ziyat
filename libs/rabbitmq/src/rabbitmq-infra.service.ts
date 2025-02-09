/* eslint-disable no-promise-executor-return */
import { Inject, Injectable } from '@nestjs/common';
import { ChannelWrapper } from 'amqp-connection-manager';
import { Channel, ConfirmChannel, ConsumeMessage } from 'amqplib';
import * as dayjs from 'dayjs';
import { groupBy, keyBy } from 'lodash';

import { AppLoggerService } from '@/libs/logger';

import { RabbitSubscriber } from './explorer.service';
import {
  RABBIT_DEFAULT_CHANNEL_WRAPPER_TOKEN,
  RABBIT_MERGED_MODULE_OPTIONS_TOKEN,
} from './rabbitmq.di-tokens';
import { RabbitMQQueueAssertionError } from './rabbitmq.errors';
import { RabbitMQExchangeOptions, RabbitMQMergedModuleOptions, SubscriberOptions } from './types';

/**
 * This service is responsible for setting up RabbitMQ infrastructure components
 * like exchanges, queues, and bindings and managing message retries.
 *
 * @class RabbitMQInfraService
 */
@Injectable()
export class RabbitMQInfraService {
  private readonly BACKOFF_TIMES = [
    { amount: 5, unit: 'seconds' },
    { amount: 10, unit: 'seconds' },
    { amount: 1, unit: 'minutes' },
    { amount: 10, unit: 'minutes' },
    { amount: 1, unit: 'hours' },
  ] satisfies { amount: number; unit: dayjs.ManipulateType }[];

  private readonly BACKOFF_TIMES_IN_MS = this.BACKOFF_TIMES.map((backoffTime) => {
    const now = dayjs();
    const difference = now.add(backoffTime.amount, backoffTime.unit).valueOf() - dayjs().valueOf();
    return Math.round(difference / 1000) * 1000;
  });

  private readonly MAX_RETRIES = this.BACKOFF_TIMES.length;

  constructor(
    @Inject(RABBIT_DEFAULT_CHANNEL_WRAPPER_TOKEN)
    private readonly defaultChannelWrapper: ChannelWrapper,
    @Inject(RABBIT_MERGED_MODULE_OPTIONS_TOKEN)
    private readonly moduleOptions: RabbitMQMergedModuleOptions,
    private readonly logger: AppLoggerService,
  ) {}

  /**
   * Configures RabbitMQ exchanges based on provided subscribers.
   * @param {RabbitSubscriber[]} subscribers - An array of RabbitSubscriber objects to set up exchanges for.
   */
  async setupExchanges(subscribers: RabbitSubscriber[]) {
    // NOTE: using explicit promise, since addSetup does not wait
    await new Promise<void>((resolve, reject) => {
      void this.defaultChannelWrapper.addSetup(async (channel: ConfirmChannel) => {
        try {
          await this.setupRetryExchanges(channel, subscribers);
          resolve();
        } catch (err) {
          reject(err);
        }
      });
    });
  }

  /**
   * Handles retry logic for RabbitMQ messages. If a message exceeds the maximum
   * allowed retries, it gets rejected; otherwise, it gets republished to a delay
   * queue for subsequent retries.
   *
   * @private
   * @param {Channel} channel - The channel object representing the AMQP channel.
   * @param {ConsumeMessage} message - The message object representing the consumed RabbitMQ message.
   * @param {string} originalExchange - The name of the original exchange the message was published to.
   * @param {string} originalQueueName - The name of the original queue the message was consumed from.
   */
  private async handleRetry(
    channel: Channel,
    message: ConsumeMessage,
    originalExchange: string,
    originalQueueName: string,
  ) {
    const retryCount = message.properties.headers['x-retry-count'] || 0;

    if (retryCount >= this.MAX_RETRIES) {
      return channel.reject(message, false);
    }

    const delay = this.BACKOFF_TIMES_IN_MS[retryCount];
    const delayQueue = await this.setupDelayQueue(
      channel,
      originalExchange,
      originalQueueName,
      delay,
    );

    // Republish the message to the delay exchange with routing key delay.X and header with original routing key
    const originalRoutingKey = message.fields.routingKey;
    channel.publish(delayQueue.exchange, originalRoutingKey, message.content, {
      headers: {
        'x-retry-count': retryCount + 1,
      },
      CC: [`${delayQueue.routingKey}`],
    });

    channel.ack(message);
  }

  /**
   * Sets up a delay queue and binds it to the corresponding delay exchange.
   * This delay queue is used to hold the messages for a certain delay before
   * they are routed to the original exchange, enabling message retries with
   * increasing delays.
   *
   * @private
   * @param {Channel} channel - The channel object representing the AMQP channel.
   * @param {string} originalExchange - The name of the original exchange the message was published to.
   * @param {string} queueName - The name of the original queue the message was consumed from.
   * @param {number} delay - The delay time in milliseconds that the message should be held in the delay queue.
   * @returns {Object} - The parameters including exchange, routing key, and queue name, used for setting up the delay queue.
   * @throws {RabbitMQQueueAssertionError} - Throws an error if there is an issue asserting the queue.
   *
   * @example
   * ```typescript
   * await this.setupDelayQueue(channel, 'myExchange', 'myQueue', 5000);
   * ```
   */
  private async setupDelayQueue(
    channel: Channel,
    originalExchange: string,
    queueName: string,
    delay: number,
  ) {
    const params = this.getDelayQueueParams(originalExchange, queueName, delay);

    await channel.assertQueue(params.queue, {
      durable: true,
      autoDelete: true,
      messageTtl: delay,
      expires: delay * 2,
      deadLetterExchange: originalExchange,
    });

    await channel.bindQueue(params.queue, params.exchange, params.routingKey);

    return params;
  }

  /**
   * Asserts a RabbitMQ queue based on provided queue options and binds
   * it to the given exchange with the specified routing keys.
   * Handles any error during the assertion of the queue and logs it.
   *
   * @private
   * @param {ConfirmChannel} channel - The channel object representing the AMQP channel.
   * @param {SubscriberOptions} options - An object containing routing key, queue name, queue options, and exchange name.
   * @returns {string} - The name of the asserted queue.
   * @throws {RabbitMQQueueAssertionError} - Throws an error if there is an issue asserting the queue.
   *
   * @example
   * ```typescript
   * await this.setupQueue(channel, {
   *   routingKey: 'my.routing.key',
   *   queue: 'myQueue',
   *   queueOptions: { durable: true },
   *   exchange: 'myExchange'
   * });
   * ```
   */
  private async setupQueue(
    channel: ConfirmChannel,
    { routingKey, queue: queueName, queueOptions, exchange }: SubscriberOptions,
  ) {
    const { queue } = await channel.assertQueue(queueName, queueOptions).catch((err) => {
      this.logger.error(`Error asserting queue ${queueName}`, err);
      throw new RabbitMQQueueAssertionError(`Error asserting queue ${err}`);
    });

    const routingKeys = Array.isArray(routingKey) ? routingKey : [routingKey];

    await Promise.all(routingKeys.map(async (key) => channel.bindQueue(queue, exchange, key)));

    return queue;
  }

  /**
   * This method sets up necessary RabbitMQ retry exchanges, queues, and bindings
   * for handling message retries and failures, based on the provided subscribers and exchanges.
   *
   * @private
   * @param {ConfirmChannel} channel - The channel object representing the AMQP channel.
   * @param {RabbitSubscriber[]} subscribers - An array of RabbitSubscriber objects to set up retry exchanges for.
   */
  private async setupRetryExchanges(channel: ConfirmChannel, subscribers: RabbitSubscriber[]) {
    const exchangesByName = keyBy(this.moduleOptions.exchanges, (exchange) => exchange.name);

    const groupedByExchange = groupBy(subscribers, ({ options }) => options.exchange);

    // Process each exchange and its corresponding subscribers.
    for (const [exchangeName, exchangeSubscribers] of Object.entries(groupedByExchange)) {
      const exchange = exchangesByName[exchangeName];
      // Assert and configure necessary exchanges and queues for each subscriber.
      await this.configureExchangesAndQueues(channel, exchange, exchangeSubscribers);
    }
  }

  /**
   * This method asserts and configures necessary exchanges and queues
   * for handling message retries and failures for the provided exchange and its subscribers.
   *
   * @private
   * @param {ConfirmChannel} channel - The channel object representing the AMQP channel.
   * @param {Exchange} exchange - The exchange object to set up the retry infrastructure for.
   * @param {RabbitSubscriber[]} exchangeSubscribers - An array of RabbitSubscriber objects corresponding to the provided exchange.
   */
  private async configureExchangesAndQueues(
    channel: ConfirmChannel,
    exchange: RabbitMQExchangeOptions,
    exchangeSubscribers: RabbitSubscriber[],
  ) {
    const {
      alternate: alternateExchange,
      failed: failedExchange,
      retry: retryExchange,
      delay: delayExchange,
    } = this.getExchangeNames(exchange.name);

    await channel.assertExchange(exchange.name, exchange.type, {
      durable: true,
      autoDelete: false,
      alternateExchange,
    });

    await channel.assertExchange(alternateExchange, 'fanout', {
      durable: true,
      autoDelete: false,
    });

    const alternateQueueName = alternateExchange;

    await this.setupQueue(channel, {
      exchange: alternateExchange,
      routingKey: '*',
      queue: alternateQueueName,
      queueOptions: {
        durable: true,
        autoDelete: false,
        deadLetterExchange: failedExchange,
      },
    });

    await channel.assertExchange(failedExchange, 'topic', {
      durable: true,
      autoDelete: false,
    });

    await channel.assertExchange(retryExchange, 'topic', {
      durable: true,
      autoDelete: false,
    });

    await channel.assertExchange(delayExchange, 'topic', {
      durable: true,
      autoDelete: false,
    });

    for (const subscriber of exchangeSubscribers) {
      const subscriberQueueName = subscriber.options.queue;

      await this.setupQueue(channel, {
        ...subscriber.options,
        queueOptions: {
          ...subscriber.options.queueOptions,
          deadLetterExchange: retryExchange,
        },
      });

      const retryQueueName = `${subscriberQueueName}.retry`;

      await this.setupQueue(channel, {
        exchange: retryExchange,
        routingKey: subscriber.options.routingKey,
        queue: retryQueueName,
        queueOptions: {
          durable: true,
          autoDelete: false,
          deadLetterExchange: failedExchange,
        },
      });

      await channel.consume(retryQueueName, async (message) =>
        this.handleRetry(channel, message, exchange.name, subscriberQueueName),
      );

      const failedQueueName = `${subscriberQueueName}.failed`;

      await this.setupQueue(channel, {
        exchange: failedExchange,
        routingKey: subscriber.options.routingKey,
        queue: failedQueueName,
        queueOptions: {
          durable: true,
          autoDelete: false,
        },
      });
    }
  }

  private getExchangeNames(exchangeName: string) {
    return {
      retry: `${exchangeName}.retry`,
      delay: `${exchangeName}.delay`,
      alternate: `${exchangeName}.alternate`,
      failed: `${exchangeName}.failed`,
    };
  }

  private getDelayQueueParams(originalExchange: string, queueName: string, delay: number) {
    const { delay: exchange } = this.getExchangeNames(originalExchange);

    return {
      exchange,
      routingKey: `delay.${delay}`,
      queue: `${queueName}.delay.${delay}`,
    };
  }
}
