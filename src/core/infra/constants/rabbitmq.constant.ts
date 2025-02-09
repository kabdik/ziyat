type ExchangeType = 'direct' | 'topic' | 'fanout';

export interface QueueConfig {
  name: string;
}
export interface RoutingKeyConfig {
  name: string;
  queues: Record<string, QueueConfig>;
}

export interface ExchangeConfig {
  name: string;
  type: ExchangeType;
  routingKeys: Record<string, RoutingKeyConfig>;
}

export const RABBITMQ_EXCHANGES = {
  paymentProvider: {
    name: 'payment.provider',
    type: 'topic',
    routingKeys: {
      webhook: {
        name: 'webhook',
        queues: {
          webhookHandler: {
            name: 'webhook.handler',
          },
        },
      },
    },
  },
  webhookSender: {
    name: 'webhook.sender',
    type: 'topic',
    routingKeys: {
      webhookSend: {
        name: 'webhook.send',
        queues: {
          webhookSender: {
            name: 'webhook.sender',
          },
        },
      },
    },
  },
} as const satisfies Record<string, ExchangeConfig>;
