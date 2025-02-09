import { Injectable } from "@nestjs/common";

import { RepositoryBase } from "@/core/domain/repository.base";
import { Paginated, PaginatedQueryParams } from "@/core/domain/repository.interface";
import { PrismaService } from "@/infra/drivers/prisma/prisma.service";
import { UserMapper } from "@/modules/auth/application/mappers/user.mapper";

import { UserRepositoryPort } from "../../domain/user-repository.port";
import { UserEntity } from "../../domain/user.entity";

@Injectable()
export class PrismaUserRepositoryAdapter
    extends RepositoryBase<UserEntity> implements UserRepositoryPort {
    constructor(
        private readonly prisma: PrismaService,
        private readonly mapper: UserMapper,

    ) {
        super(prisma)
    }

    async create(entity: UserEntity) {
        const user = await this.prisma.user.create({
            data: this.mapper.toPersistence(entity)
        })
        return this.mapper.toDomain(user)
    }

    async findByEmail(email: string) {
        const user = await this.prisma.user.findUnique({ where: { email } })

        return user && this.mapper.toDomain(user)
    }

    async findAll(): Promise<UserEntity[]> {
        throw new Error('Method not implemented.');
    }

    async findAllPaginated(params: PaginatedQueryParams): Promise<Paginated<UserEntity>> {
        throw new Error('Method not implemented.');
    }

    async update(): Promise<void> {
        throw new Error('Method not implemented.');
    }

    async delete(): Promise<boolean> {
        throw new Error('Method not implemented.');
    }

    async findById(): Promise<UserEntity> {
        throw new Error('Method not implemented.');
    }
}