import { ChannelWrapper } from 'amqp-connection-manager';
import { Channel, ConsumeMessage } from 'amqplib';

export interface RabbitSubscribeParams {
  exchange: string;
  routingKey?: string;
  queue: string;
  queueOptions?: {
    durable?: boolean;
  };
}

export type ExchangeType = 'direct' | 'fanout' | 'topic';

export interface RabbitMQExchangeOptions {
  name: string;
  type: ExchangeType;
}

export interface RabbitMQModuleOptions {
  exchanges: RabbitMQExchangeOptions[];
  uri: string;
  timeout?: number;
  channels?: RabbitMQChannelOptions[];
  prefetchCount?: number;
}

export type ChannelWrappers = Record<string, ChannelWrapper>;

export type RabbitMQMergedModuleOptions = Required<RabbitMQModuleOptions>;

export type DefaultRabbitMQModuleOptions<T = RabbitMQModuleOptions> = {
  [K in keyof T]: T[K] extends Required<T>[K] ? T[K] | undefined : T[K];
};

export interface QueueOptions {
  durable?: boolean;
  exclusive?: boolean;
  autoDelete?: boolean;
  arguments?: any;
  messageTtl?: number;
  deadLetterExchange?: string;
  deadLetterRoutingKey?: string;
  maxLength?: number;
  maxPriority?: number;
  /**
   * Set this to the name of the channel you want to consume messages from to enable this feature.
   *
   * If channel does not exist or you haven't specified one, it will use the default channel.
   *
   * For channel to exist it needs to be created in module config.
   */
  channel?: string;
}

export interface SubscriberOptions {
  exchange: string;
  routingKey: string | string[];
  queue: string;
  queueOptions?: QueueOptions;
  /**
   * A function that will be called if an error is thrown during processing of an incoming message
   */
  errorHandler?: MessageErrorHandler;
  allowNonJsonMessages?: boolean;
  createQueueIfNotExists?: boolean;
}

export type MessageErrorHandler = (
  channel: Channel,
  msg: ConsumeMessage,
  error: any,
) => Promise<void> | void;

export interface RabbitMQChannelOptions {
  name: string;
  /**
   * Specifies prefetch count for the channel. If not specified will use the default one.
   */
  prefetchCount?: number;
  /**
   * Makes this channel the default for all handlers.
   *
   * If no channel has been marked as default, new channel will be created.
   */
  default?: boolean;
}
