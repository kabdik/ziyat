import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { JwtServicePort } from './jwt-service.port';



@Injectable()
export class JwtServiceAdapter implements JwtServicePort {
    constructor(private readonly jwtService: JwtService) { }

    generateTokens(payload: { sub: number; email: string }) {
        // You can use environment variables or configuration services here.
        const accessToken = this.jwtService.sign(payload, {
            secret: 'access-secret', // e.g., 'access-secret'
            expiresIn: '1h',
        });
        const refreshToken = this.jwtService.sign(payload, {
            secret: 'refresh-secret', // e.g., 'refresh-secret'
            expiresIn: '7d',
        });
        return { accessToken, refreshToken };

    }

    verifyToken(token: string) {
        return this.jwtService.verify(token, {
            secret: process.env.JWT_ACCESS_TOKEN_SECRET,
        });
    }
}
