import { Module } from "@nestjs/common";
import { JwtModule as NestJwtModule } from '@nestjs/jwt'

import { JwtServiceAdapter } from "./jwt-service.adapter";
import { JwtServicePort } from "./jwt-service.port";

@Module({
    imports: [NestJwtModule.register({
        secret: 'secret',
    })],
    providers: [{
        provide: JwtServicePort,
        useClass: JwtServiceAdapter
    }],
    exports: [JwtServicePort]
})
export class JwtModule {

}