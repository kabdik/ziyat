import { BadRequestException } from '@nestjs/common';

export class ConcurrencyError extends BadRequestException {
  constructor() {
    super(`Record is already was modified, try again`);
  }
}
