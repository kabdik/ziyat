import { get } from 'env-var';

export enum AppEnv {
  DEVELOPMENT = 'development',
  PRODUCTION = 'production',
  TEST = 'test',
}

const APP_ENVS = Object.values(AppEnv);

export class ServerConfig {
  public static readonly apiPrefix: string = get('SERVER_API_PREFIX')
    .default('api/v1')
    .asString();

  public static readonly port: number = get('SERVER_PORT')
    .default(3000)
    .asInt();

  public static readonly nodeEnv: AppEnv = get('NODE_ENV')
    .default('development')
    .required()
    .asEnum(APP_ENVS);

  public static readonly corsEnable: boolean = get('CORS_ENABLE')
    .default('true')
    .asBool();

  public static readonly enableShutdownHooks: boolean = get(
    'ENABLE_SHUTDOWN_HOOKS',
  )
    .default('true')
    .asBool();
}
