import { get } from 'env-var';

export class AWSConfig {
  public static readonly accessKeyId: string = get('AWS_ACCESS_KEY_ID').required().asString();

  public static readonly secretKey: string = get('AWS_SECRET_ACCESS_KEY').required().asString();

  public static readonly region: string = get('AWS_REGION').required().asString();
}
