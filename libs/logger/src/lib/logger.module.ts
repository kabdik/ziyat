import { DynamicModule, Global, Module } from '@nestjs/common';

import { LOGGER_MODULE_OPTIONS } from './logger.constants';
import { AppLoggerService } from './logger.service';
import { LoggerModuleOptions } from './types';

@Global()
@Module({})
export class LoggerModule {
  static forRoot(options: LoggerModuleOptions): DynamicModule {
    return {
      module: LoggerModule,
      providers: [
        {
          provide: LOGGER_MODULE_OPTIONS,
          useValue: options,
        },
        AppLoggerService,
      ],
      exports: [AppLoggerService],
    };
  }
}
