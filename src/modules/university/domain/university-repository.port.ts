import { IRepository } from "@/core/domain/repository.interface";

import { UniversityEntity } from "./university.entity";


export interface UniversityRepositoryPort extends IRepository<UniversityEntity> {
}

export const UniversityRepositoryPort: unique symbol = Symbol('UNIVERSITY_REPOSITORY');
