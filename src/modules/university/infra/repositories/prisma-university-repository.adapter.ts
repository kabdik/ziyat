import { Injectable } from "@nestjs/common";

import { RepositoryBase } from "@/core/domain/repository.base";
import { PaginatedQueryParams, Paginated } from "@/core/domain/repository.interface";
import { PrismaService } from "@/infra/drivers/prisma/prisma.service";

import { UniversityMapper } from "../../application/university.mapper";
import { UniversityRepositoryPort } from "../../domain/university-repository.port";
import { UniversityEntity } from "../../domain/university.entity";

@Injectable()
export class PrismaUniversityRepositoryAdapter
    extends RepositoryBase<UniversityEntity> implements UniversityRepositoryPort {
    constructor(
        private readonly prisma: PrismaService,
        private readonly mapper: UniversityMapper
    ) {
        super(prisma)
    }

    async create(entity: UniversityEntity): Promise<UniversityEntity> {
        const university = await this.prisma.university.create({
            data: this.mapper.toPersistence(entity)
        })
        return this.mapper.toDomain(university)
    }

    async update(entity: UniversityEntity): Promise<void> {
        throw new Error("Method not implemented.");
    }

    async delete(entity: UniversityEntity): Promise<boolean> {
        throw new Error("Method not implemented.");
    }

    async findById(id: string): Promise<UniversityEntity> {
        throw new Error("Method not implemented.");
    }

    async findAll(): Promise<UniversityEntity[]> {
        throw new Error("Method not implemented.");
    }

    async findAllPaginated(params: PaginatedQueryParams): Promise<Paginated<UniversityEntity>> {
        const { limit, page } = params;

        const data = await this.prisma.university.findMany({
            take: limit,
            skip: limit && page ? (page - 1) * limit : undefined,
        })

        const count = await this.prisma.university.count()

        return {
            count,
            limit,
            page,
            data: data.map(university => this.mapper.toDomain(university)),
        }
    }

}