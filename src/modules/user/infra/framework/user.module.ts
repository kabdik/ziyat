import { Module } from '@nestjs/common';

import { UserMapper } from '@/modules/auth/application/mappers/user.mapper';

import { UserService } from '../../application/services/user.service';
import { USER_USE_CASES } from '../../application/use-cases';
import { UserRepositoryPort } from '../../domain/user-repository.port';
import { UserController } from '../../presentation/user.controller';
import { PrismaUserRepositoryAdapter } from '../repositories/prisma-user-repository.adapter';

const REPOSITORIES = [{
  provide: UserRepositoryPort,
  useClass: PrismaUserRepositoryAdapter
}]

@Module({
  controllers: [UserController],
  providers: [
    ...USER_USE_CASES,
    ...REPOSITORIES,
    UserMapper,
    UserService
  ],
  exports: [...REPOSITORIES, UserService, UserMapper]
})
export class UserModule { }
