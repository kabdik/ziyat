import { randomBytes } from 'crypto';

export type GenerateApiSecretParams = {
  prefix?: string;
};

export const generateApiSecret = (params?: GenerateApiSecretParams) => {
  const secret = randomBytes(32).toString('hex');

  return `${params?.prefix}_${secret}`;
};
