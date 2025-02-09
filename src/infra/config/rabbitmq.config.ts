import { get } from 'env-var';

export class RabbitMQConfig {
  public static readonly url: string = get('RABBIT_MQ_URL').required().asString();
}
