import bcrypt from 'bcryptjs';
import { AuthRepository } from '@modules/auth/repositories/auth.repository.js';
import type {
  UserRegisterInput,
  UserLoginInput,
  RefreshTokenInput,
} from '@modules/auth/types/auth.type.js';
import { ApiError } from '@core/middlewares/error-handler.middleware.js';
import { jwtUtil } from '@core/auth/jwt.util.js';
import { env } from '@config/env.schema.js';

type PublicUser = {
  id: string;
  name: string;
  email: string;
  createdAt: Date;
  updatedAt: Date;
};

function toPublicUser(user: {
  id: string;
  name: string;
  email: string;
  createdAt: Date;
  updatedAt: Date;
}): PublicUser {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

export class AuthService {
  private authRepository = new AuthRepository();

  async register(userData: UserRegisterInput): Promise<{ user: PublicUser }> {
    const existingUser = await this.authRepository.findByEmail(userData.email);
    if (existingUser) {
      throw ApiError.conflict('Email is already registered');
    }

    const passwordHash = await bcrypt.hash(userData.password, 10);
    const newUser = await this.authRepository.createUser({
      ...userData,
      passwordHash,
    });

    return { user: toPublicUser(newUser) };
  }

  async login(credentials: UserLoginInput): Promise<{
    user: PublicUser;
    accessToken: string;
    refreshToken: string;
    expiresIn: string;
  }> {
    const user = await this.authRepository.findByEmail(credentials.email);
    if (!user) {
      throw ApiError.unauthorized('Invalid email or password');
    }

    const valid = await bcrypt.compare(credentials.password, user.passwordHash);
    if (!valid) {
      throw ApiError.unauthorized('Invalid email or password');
    }

    const accessToken = jwtUtil.signAccessToken({ sub: user.id, email: user.email });
    const refreshToken = jwtUtil.signRefreshToken({ sub: user.id });

    return {
      user: toPublicUser(user),
      accessToken,
      refreshToken,
      expiresIn: env.JWT_ACCESS_EXPIRES_IN,
    };
  }

  async refresh(input: RefreshTokenInput): Promise<{
    accessToken: string;
    refreshToken: string;
    expiresIn: string;
  }> {
    const payload = jwtUtil.verifyRefreshToken(input.refreshToken);
    const user = await this.authRepository.findById(payload.sub);
    if (!user) {
      throw ApiError.unauthorized('User no longer exists');
    }

    const accessToken = jwtUtil.signAccessToken({ sub: user.id, email: user.email });
    const refreshToken = jwtUtil.signRefreshToken({ sub: user.id });

    return {
      accessToken,
      refreshToken,
      expiresIn: env.JWT_ACCESS_EXPIRES_IN,
    };
  }
}
