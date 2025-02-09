import { Inject, Injectable, LoggerService, Scope } from '@nestjs/common';

import { Logger } from './logger';
import { LOGGER_MODULE_OPTIONS } from './logger.constants';
import { LoggerModuleOptions, LoggerOptions } from './types';

@Injectable({ scope: Scope.TRANSIENT })
export class AppLoggerService implements LoggerService {
  private logger: Logger;
  private loggerOptions: LoggerOptions;

  constructor(
    @Inject(LOGGER_MODULE_OPTIONS)
    options: LoggerModuleOptions,
  ) {
    this.loggerOptions = {
      serviceName: options.serviceName,
      logLevel: options.logLevel,
      isProduction: options.isProduction ?? process.env.NODE_ENV === 'production',
    };
    this.logger = new Logger(this.loggerOptions);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public debug(message: string, ...args: any[]): void {
    this.logger.debug(message, ...args);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public info(message: string, ...args: any[]): void {
    this.logger.info(message, ...args);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public warn(message: string, ...args: any[]): void {
    this.logger.warn(message, ...args);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public error(message: string, ...args: any[]): void {
    this.logger.error(message, ...args);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public log(message: string, ...args: any[]): void {
    this.logger.info(message, ...args);
  }

  /**
   * Generated a new logger instance with the same configuration of the parent with additional metadata.
   * @param  {Record<string, unknown} metadata?
   * @returns Logger
   */
  public child(metadata?: Record<string, unknown>): Logger {
    const childOptions = {
      ...this.loggerOptions,
      metadata: {
        ...this.loggerOptions.metadata,
        metadata,
      },
    };

    return new Logger(childOptions);
  }
}
