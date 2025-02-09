import { Body, Controller, Post } from "@nestjs/common";

import { LoginDto } from "./dto/login.dto";
import { SignUpDto } from "./dto/sign-up.dto";
import { LoginUseCase } from "../application/use-cases/login.use-case";
import { SignUpUseCase } from "../application/use-cases/sign-up.use-case";

@Controller('auth')
export class AuthController {
    constructor(
        private readonly signUpUseCase: SignUpUseCase,
        private readonly loginUseCase: LoginUseCase
    ) {
    }

    @Post('sign-up')
    public async signUp(@Body() data: SignUpDto) {
        return this.signUpUseCase.execute(data)
    }

    @Post('login')
    public async login(@Body() data: LoginDto) {
        return this.loginUseCase.execute(data)
    }
}