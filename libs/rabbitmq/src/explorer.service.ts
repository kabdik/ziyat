import { Injectable } from '@nestjs/common';
import { MetadataScanner, ModulesContainer, Reflector } from '@nestjs/core';

import { SubscriberHandler } from './rabbitmq-client';
import { RABBIT_HANDLER_TOKEN } from './rabbitmq.di-tokens';
import { SubscriberOptions } from './types';

export type RabbitSubscriber = { handler: SubscriberHandler; options: SubscriberOptions };

@Injectable()
export class ExplorerService {
  constructor(
    private readonly reflector: Reflector,
    private readonly modulesContainer: ModulesContainer,
    private readonly metadataScanner: MetadataScanner,
  ) {}

  getSubscribers() {
    const subscribers: RabbitSubscriber[] = [];
    const visitedNames = new Map<string, boolean>();

    for (const module of [...this.modulesContainer.values()]) {
      for (const [, instanceWrapper] of [...module.providers, ...module.controllers]) {
        const { instance } = instanceWrapper;

        if (!instance) continue;

        const prototype = Object.getPrototypeOf(instance);

        const methodNames = this.metadataScanner.getAllMethodNames(prototype);

        for (const methodName of methodNames) {
          if (visitedNames.has(this.getUniqueMethodName(prototype, methodName))) {
            continue;
          }

          visitedNames.set(this.getUniqueMethodName(prototype, methodName), true);

          const handler = prototype[methodName] as SubscriberHandler;

          if (typeof handler !== 'function') {
            continue;
          }

          const subscriberOptions = this.reflector.get<SubscriberOptions>(
            RABBIT_HANDLER_TOKEN,
            handler,
          );

          if (subscriberOptions) {
            subscribers.push({
              handler: handler.bind(instance),
              options: subscriberOptions,
            });
          }
        }
      }
    }
    return subscribers;
  }

  private getUniqueMethodName(prototype: any, methodName: string) {
    const className = prototype.constructor.name;

    return `${className}.${methodName}`;
  }
}
