import { BadRequestException, Inject, Injectable } from "@nestjs/common";
import * as bcrypt from 'bcrypt'

import { UseCase } from "@/core/domain/use-case.interface";
import { UserService } from "@/modules/user/application/services/user.service";
import { UserRepositoryPort } from "@/modules/user/domain/user-repository.port";


interface Props {
    email: string;
    password: string;
    name: string;
}

@Injectable()
export class SignUpUseCase implements UseCase<Props, any> {
    constructor(
        @Inject(UserRepositoryPort)
        private readonly userRepo: UserRepositoryPort,
        private readonly userService: UserService
    ) { }

    async execute(props: Props) {
        const user = await this.userRepo.findByEmail(props.email)
        if (user) {
            throw new BadRequestException('The user with this email already exists')
        }

        const hashedPassword = await bcrypt.hash(props.password, 10);

        const newUserData = {
            email: props.email,
            password: hashedPassword,
            name: props.name
        }
        return this.userService.createUser(newUserData)

    }
}