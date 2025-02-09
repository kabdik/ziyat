import { Module } from "@nestjs/common";

import { JwtModule } from "@/infra/drivers/jwt/jwt.module";
import { UserModule } from "@/modules/user/infra/framework/user.module";

import { AUTH_USE_CASES } from "../../application/use-cases";
import { AuthController } from "../../presentation/auth.conrtoller";

@Module({
    imports: [UserModule, JwtModule],
    controllers: [AuthController],
    providers: [...AUTH_USE_CASES]
})
export class AuthModule {
}