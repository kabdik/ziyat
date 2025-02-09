import { ConflictException } from '@nestjs/common';

export class UniqueKeyError extends ConflictException {
  constructor(fields: string[]) {
    super(`Another record with the same key already exist (${fields.join(', ')})`);
  }
}
