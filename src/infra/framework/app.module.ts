import { HttpException, Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { SentryInterceptor } from '@ntegral/nestjs-sentry';

import { LoggerModule } from '@/libs/logger';
import { AuthModule } from '@/modules/auth/infra/auth.module';
import { UniversityModule } from '@/modules/university/infra/university.module';
import { UserModule } from '@/modules/user/infra/user.module';


import { PrismaModule } from '../drivers/prisma/prisma.module';

@Module({
  imports: [
    LoggerModule.forRoot({
      serviceName: 'server',
    }),
    PrismaModule,
    UserModule,
    AuthModule,
    UniversityModule
  ],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useFactory: () =>
        new SentryInterceptor({
          filters: [
            {
              type: HttpException,
              filter: (exception: HttpException) => exception.getStatus() > 500,
            },
          ],
        }),
    },
  ],
})
export class AppModule { }
