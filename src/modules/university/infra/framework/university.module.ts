import { Module } from '@nestjs/common';


import { UniversityMapper } from '../../application/university.mapper';
import { UNIVERSITY_USE_CASES } from '../../application/use-cases';
import { UniversityRepositoryPort } from '../../domain/university-repository.port';
import { UniversityController } from '../../presentation/university.controller';
import { PrismaUniversityRepositoryAdapter, } from '../repositories/prisma-university-repository.adapter';

const REPOSITORIES = [{
    provide: UniversityRepositoryPort,
    useClass: PrismaUniversityRepositoryAdapter
}]

@Module({
    controllers: [UniversityController],
    providers: [
        ...UNIVERSITY_USE_CASES,
        ...REPOSITORIES,
        UniversityMapper
    ],
    exports: [...REPOSITORIES, ...UNIVERSITY_USE_CASES]
})
export class UniversityModule { }
