import { Inject, Injectable } from "@nestjs/common";

import { PaginatedQueryParams } from "@/core/domain/repository.interface";
import { UseCase } from "@/core/domain/use-case.interface";

import { UniversityRepositoryPort } from "../../domain/university-repository.port";
import { UniversityMapper } from "../university.mapper";

interface Props extends PaginatedQueryParams {
}

@Injectable()
export class GetAllUseCase implements UseCase<Props, any> {
    constructor(
        @Inject(UniversityRepositoryPort)
        private readonly universityRepo: UniversityRepositoryPort,
        private readonly mapper: UniversityMapper
    ) { }

    async execute(props: Props): Promise<any> {
        const universities = await this.universityRepo.findAllPaginated(props)

        return {
            count: universities.count,
            data: universities.data.map(uni => this.mapper.toUi(uni))
        }
    }
}