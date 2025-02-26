import { Body, Controller, Get, Post, Query } from "@nestjs/common";


import { PaginatedQueryParams } from "@/core/domain/repository.interface";

import { CreateUniversityDto } from "./dto/create-university.dto";
import { CreateUseCase } from "../application/use-cases/create.use-case";
import { GetAllUseCase } from "../application/use-cases/get-all.use-case";

@Controller('university')
export class UniversityController {
    constructor(
        private readonly getAllUseCase: GetAllUseCase,
        private readonly createUseCase: CreateUseCase
    ) {
    }

    @Get('')
    public async getAll(@Query() params: PaginatedQueryParams) {
        return this.getAllUseCase.execute(params)
    }

    @Post('')
    public async create(@Body() params: CreateUniversityDto) {
        return this.createUseCase.execute(params)
    }
}