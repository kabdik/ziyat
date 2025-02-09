import { get } from 'env-var';

export class SendGridConfig {
  public static readonly apiKeyName: string = 'apikey';

  public static readonly fromAddress: string = get('SENDGRID_FROM_ADDRESS')
    .required()
    .asString();

  public static readonly isSecure: boolean = get('SENDGRID_SECURE')
    .default('true')
    .asBool();

  public static readonly host: string = get('SENDGRID_HOST')
    .default('smtp.sendgrid.net')
    .asString();

  public static readonly port: number = get('SENDGRID_PORT')
    .default(465)
    .asInt();

  public static readonly apiKey: string = get('SENDGRID_API_KEY')
    .required()
    .asString();
}
