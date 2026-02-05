import jwt, { type SignOptions } from 'jsonwebtoken';
import { env } from '@config/env.schema.js';

const ALGORITHM = 'HS256';

export type AccessTokenPayload = {
  sub: string;
  email: string;
  type: 'access';
  iat?: number;
  exp?: number;
};

export type RefreshTokenPayload = {
  sub: string;
  type: 'refresh';
  iat?: number;
  exp?: number;
};

export type TokenPayload = AccessTokenPayload | RefreshTokenPayload;

function isAccessPayload(payload: TokenPayload): payload is AccessTokenPayload {
  return payload.type === 'access';
}

export const jwtUtil = {
  signAccessToken(payload: Omit<AccessTokenPayload, 'type' | 'iat' | 'exp'>): string {
    return jwt.sign({ ...payload, type: 'access' as const }, env.JWT_ACCESS_SECRET, {
      algorithm: ALGORITHM,
      expiresIn: env.JWT_ACCESS_EXPIRES_IN,
    } as SignOptions);
  },

  signRefreshToken(payload: Omit<RefreshTokenPayload, 'type' | 'iat' | 'exp'>): string {
    const secret = env.JWT_REFRESH_SECRET ?? env.JWT_ACCESS_SECRET;
    return jwt.sign({ ...payload, type: 'refresh' as const }, secret, {
      algorithm: ALGORITHM,
      expiresIn: env.JWT_REFRESH_EXPIRES_IN,
    } as SignOptions);
  },

  verifyAccessToken(token: string): AccessTokenPayload {
    const decoded = jwt.verify(token, env.JWT_ACCESS_SECRET, {
      algorithms: [ALGORITHM],
    }) as TokenPayload;
    if (!isAccessPayload(decoded)) {
      throw new Error('Invalid token type');
    }
    return decoded;
  },

  verifyRefreshToken(token: string): RefreshTokenPayload {
    const secret = env.JWT_REFRESH_SECRET ?? env.JWT_ACCESS_SECRET;
    const decoded = jwt.verify(token, secret, {
      algorithms: [ALGORITHM],
    }) as TokenPayload;
    if (decoded.type !== 'refresh') {
      throw new Error('Invalid token type');
    }
    return decoded;
  },
};
