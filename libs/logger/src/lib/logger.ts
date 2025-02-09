import { Format } from 'logform';
import {
  createLogger,
  format,
  Logger as WindstonLogger,
  transports,
} from 'winston';

import { customFormat } from './cli-format';
import { ILogger, LoggerOptions, LogLevel } from './types';

const logTransports = [new transports.Console()];

export class Logger implements ILogger {
  private logger: WindstonLogger;
  public level: LogLevel;

  constructor(private readonly options: LoggerOptions) {
    this.level = options.logLevel ?? LogLevel.DEBUG;

    this.logger = createLogger({
      defaultMeta: {
        component: options.serviceName,
        ...options.metadata,
      },
      level: this.level,
      format: this.getLoggerFormat(),
      transports: logTransports,
      handleExceptions: true,
      exitOnError: true,
      exceptionHandlers: logTransports,
      rejectionHandlers: logTransports,
    });
  }

  private getLoggerFormat(): Format {
    const developmentFormats: Format[] = [
      format.errors({ stack: true }),
      format.timestamp(),
      customFormat(),
    ];
    if (this.options.additionalDevelopmentFormats) {
      developmentFormats.push(...this.options.additionalDevelopmentFormats);
    }
    if (this.options.additionalFormats) {
      developmentFormats.push(...this.options.additionalFormats);
    }

    const productionFormats: Format[] = [
      format.errors({ stack: true }),
      format.timestamp(),
      format.json(),
    ];
    if (this.options.additionalFormats) {
      productionFormats.push(...this.options.additionalFormats);
    }

    return this.options.isProduction
      ? format.combine(...productionFormats)
      : format.combine(...developmentFormats);
  }

  debug(message: string, params?: Record<string, unknown>): void {
    this.logger.debug(message, params);
  }

  info(message: string, params?: Record<string, unknown>): void {
    this.logger.info(message, params);
  }

  warn(message: string, params?: unknown): void {
    this.logger.warn(message, params);
  }

  error(message: string, params?: Record<string, unknown>, err?: Error): void {
    this.logger.error(message, params, err);
  }

  child(metadata?: Pick<LoggerOptions, 'metadata'>): Logger {
    return new Logger({
      ...this.options,
      metadata: { ...this.options.metadata, metadata },
    });
  }
}
