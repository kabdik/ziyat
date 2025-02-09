import { get } from 'env-var';

import { AppEnv, ServerConfig } from './server.config';

const databaseUrlEnvName =
  ServerConfig.nodeEnv === AppEnv.TEST ? 'TEST_DATABASE_URL' : 'DATABASE_URL';

export class DatabaseConfig {
  public static readonly databaseUrl: string = get(databaseUrlEnvName).required().asString();
}
