import { prisma } from '@core/database/prisma.client.js';
import type { UserRegisterInput } from '@modules/auth/types/auth.type.js';
import type { User } from '@prisma/client';

export class AuthRepository {
  async createUser(userData: UserRegisterInput & { passwordHash: string }): Promise<User> {
    return await prisma.user.create({
      data: {
        name: userData.name,
        email: userData.email,
        passwordHash: userData.passwordHash,
      },
    });
  }

  async findByEmail(email: string): Promise<User | null> {
    return await prisma.user.findUnique({ where: { email } });
  }

  async findById(id: string): Promise<User | null> {
    return await prisma.user.findUnique({ where: { id } });
  }
}
