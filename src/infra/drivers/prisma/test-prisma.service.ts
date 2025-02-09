import { Injectable } from '@nestjs/common';

import { ExtendedTestPrismaClient } from './test-prisma-client';
import { DatabaseConfig } from '../../config/database.config';

@Injectable()
export class TestDatabaseService extends ExtendedTestPrismaClient {
  constructor() {
    super({
      datasources: {
        db: { url: DatabaseConfig.databaseUrl },
      },
      log: ['query', 'info', 'warn', 'error'],
    });
  }
}
