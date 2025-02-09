import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

import {
  PRISMA_RECORD_NOT_FOUND,
  PRISMA_CODE_UNIQUE_KEY_VIOLATION,
  PRISMA_BAD_REQUEST,
} from './prisma.constants';

export const isUniqueConstraintError = (error: unknown) =>
  error instanceof PrismaClientKnownRequestError && error.code === PRISMA_CODE_UNIQUE_KEY_VIOLATION;

export const isNotFoundError = (error: unknown) =>
  error instanceof PrismaClientKnownRequestError && error.code === PRISMA_RECORD_NOT_FOUND;

export const isBadRequestError = (error: unknown) =>
  error instanceof PrismaClientKnownRequestError && error.code === PRISMA_BAD_REQUEST;
