import { HttpException, Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { SentryInterceptor } from '@ntegral/nestjs-sentry';

import { LoggerModule } from '@/libs/logger';
import { AuthModule } from '@/modules/auth/infra/framework/auth.module';
import { UserModule } from '@/modules/user/infra/framework/user.module';


import { PrismaModule } from '../drivers/prisma/prisma.module';

@Module({
  imports: [
    LoggerModule.forRoot({
      serviceName: 'server',
    }),
    PrismaModule,
    UserModule,
    AuthModule
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
