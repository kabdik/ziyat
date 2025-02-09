import { BadRequestException, Inject, Injectable } from "@nestjs/common";
import * as bcrypt from 'bcrypt';

import { UserRepositoryPort } from "@/modules/user/domain/user-repository.port";

import { JwtServicePort } from "../../../../infra/drivers/jwt/jwt-service.port";
import { UserMapper } from "../mappers/user.mapper";

interface Props {
    email: string;
    password: string;
}

@Injectable()
export class LoginUseCase {
    constructor(
        @Inject(UserRepositoryPort)
        private readonly userRepo: UserRepositoryPort,
        @Inject(JwtServicePort)
        private readonly jwtService: JwtServicePort,
        private readonly userMapper: UserMapper
    ) { }

    async execute(props: Props) {
        const user = await this.userRepo.findByEmail(props.email)
        if (!user) {
            throw new BadRequestException('Invalid credentials')
        }
        const userProps = user.getProps()
        const isPasswordValid = await bcrypt.compare(props.password, userProps.password)
        if (!isPasswordValid) {
            throw new BadRequestException('Invalid credentials');
        }
        const tokens = this.jwtService.generateTokens({ sub: userProps.id, email: userProps.email })

        return {
            user: this.userMapper.toUi(user),
            tokens
        }
    }
}