import { Inject, Injectable } from "@nestjs/common";

import { UseCase } from "@/core/domain/use-case.interface";
import { UniversityRepositoryPort } from "@/modules/university/domain/university-repository.port";
import { UniversityEntity } from "@/modules/university/domain/university.entity";

import { UniversityMapper } from "../university.mapper";

interface Props {
    name: string;
    country: string;
    description: string;
    rating: number;
}

@Injectable()
export class CreateUseCase implements UseCase<Props, any> {
    constructor(
        @Inject(UniversityRepositoryPort)
        private readonly universityRepo: UniversityRepositoryPort,
        private readonly mapper: UniversityMapper
    ) { }

    async execute(props: Props): Promise<any> {
        const university = await this.universityRepo.create(UniversityEntity.create(props))
        return this.mapper.toUi(university)
    }
}
