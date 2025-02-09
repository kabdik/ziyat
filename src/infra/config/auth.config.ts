import { get } from 'env-var';

export class AuthConfig {
  public static readonly jwtAccessSecret: string = get('JWT_ACCESS_SECRET')
    .default('change-in-production')
    .asString();

  public static readonly jwtRefreshSecret: string = get('JWT_REFRESH_SECRET')
    .default('change-in-production')
    .asString();

  public static readonly bcryptSaltRounds: number = get('BCRYPT_SALT_ROUNDS').default(10).asInt();
}
