import { Injectable } from '@nestjs/common';

import { ExtendedPrismaClient } from './prisma-client';
import { DatabaseConfig } from '../../config/database.config';

@Injectable()
export class PrismaService extends ExtendedPrismaClient {
  constructor() {
    super({
      datasources: {
        db: { url: DatabaseConfig.databaseUrl },
      },
    });
  }
}
