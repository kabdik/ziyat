import { SetMetadata, applyDecorators } from '@nestjs/common';

import { RABBIT_HANDLER_TOKEN } from './rabbitmq.di-tokens';
import { SubscriberOptions } from './types';

export const RabbitSubscribe = (options: SubscriberOptions) =>
  applyDecorators(SetMetadata(RABBIT_HANDLER_TOKEN, options));
