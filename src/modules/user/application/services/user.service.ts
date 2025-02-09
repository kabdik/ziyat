import { Inject, Injectable } from "@nestjs/common";

import { UserMapper } from "@/modules/auth/application/mappers/user.mapper";

import { UserRepositoryPort } from "../../domain/user-repository.port";
import { UserEntity } from "../../domain/user.entity";


interface CreateUserParams {
    email: string;
    password: string;
    name: string;
}


@Injectable()
export class UserService {
    constructor(
        @Inject(UserRepositoryPort)
        private readonly userRepo: UserRepositoryPort,
        private readonly mapper: UserMapper
    ) { }

    async createUser(params: CreateUserParams) {
        const user = await this.userRepo.create(UserEntity.create(params))
        return this.mapper.toUi(user);
    }
}