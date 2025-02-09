import {
  ArgumentsHost,
  BadRequestException,
  Catch,
  HttpException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';
import { Prisma } from '@prisma/client';
import { Request, Response } from 'express';

import { DomainError } from '@/core/domain/domain-error.base';
import { UniqueKeyError } from '@/core/errors/unique-key.error';
import { AppEnv, ServerConfig } from '@/infra/config/server.config';
import { AppLoggerService } from '@/libs/logger';

export type ErrorCodesStatusMapping = Record<string, number>;

export const PRISMA_CODE_UNIQUE_KEY_VIOLATION = 'P2002';
export const PRISMA_RECORD_NOT_FOUND = 'P2025';

/**
 * {@link PrismaClientExceptionFilter} handling {@link Prisma.PrismaClientKnownRequestError} exceptions.
 */
@Catch()
export class HttpExceptionFilter extends BaseExceptionFilter {
  constructor(private logger: AppLoggerService) {
    super();
  }

  /**
   * @param exception
   * @param host
   * @returns
   */
  public catch(exception: Error, host: ArgumentsHost): HttpException | void {
    if (host.getType() === 'http') {
      const ctx = host.switchToHttp();
      const request = ctx.getRequest<Request>();
      const response = ctx.getResponse<Response>();

      const knownError = this.getKnownClientError(exception);

      if (knownError) {
        this.logger.info(knownError.message, {
          requestData: request.body,
          stack: knownError.stack,
        });
        response.status(knownError.getStatus()).json(knownError);
        return;
      }

      this.logger.error(exception.message, {
        ...exception,
        requestData: request.body,
        stack: exception.stack,
      });

      const serverError =
        ServerConfig.nodeEnv === AppEnv.PRODUCTION
          ? new InternalServerErrorException()
          : new InternalServerErrorException(exception.message);

      response.status(serverError.getStatus()).json(serverError);
      return;
    }

    return super.catch(exception, host);
  }

  /**
   * @param exception
   * @returns short message for the exception
   */
  public exceptionShortMessage(message: string): string {
    const shortMessage = message.substring(message.indexOf('→'));
    return shortMessage.substring(shortMessage.indexOf('\n')).replace(/\n/g, '').trim();
  }

  private getKnownClientError(error: Error): HttpException | null {
    const knownErrorMatchers = [this.prismaClientError, this.domainError, this.httpClientError];

    for (const matchError of knownErrorMatchers) {
      const clientError = matchError(error);

      if (clientError) {
        return clientError;
      }
    }

    return null;
  }

  private prismaClientError(this: void, error: Error): UniqueKeyError | null {
    if (!(error instanceof Prisma.PrismaClientKnownRequestError)) {
      return null;
    }

    switch (error.code) {
      case PRISMA_CODE_UNIQUE_KEY_VIOLATION: {
        const fields = (error.meta as { target: string[] }).target;
        return new UniqueKeyError(fields);
      }
      case PRISMA_RECORD_NOT_FOUND:
        return new NotFoundException();
      default:
        return null;
    }
  }

  private domainError(this: void, error: Error): BadRequestException | null {
    if (error instanceof DomainError) {
      return new BadRequestException(error.message || error.code);
    }

    return null;
  }

  private httpClientError(this: void, error: Error): HttpException | null {
    if (error instanceof HttpException) {
      return error;
    }

    return null;
  }
}
