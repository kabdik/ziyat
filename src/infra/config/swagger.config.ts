import { get } from 'env-var';

export class SwaggerConfig {
  public static readonly path: string = get('SWAGGER_PATH')
    .default('docs')
    .asString();

  public static readonly enabled: boolean = get('SWAGGER_ENABLE')
    .default('false')
    .asBool();
}
