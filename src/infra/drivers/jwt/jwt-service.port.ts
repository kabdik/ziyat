export interface JwtServicePort {
    generateTokens(payload: { sub: number; email: string }): { accessToken: string; refreshToken: string };
    verifyToken(token: string): boolean;
}

export const JwtServicePort: unique symbol = Symbol('JWT_SERVICE');