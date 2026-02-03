import type z from 'zod';
import {
  UserRegisterInputSchema,
  UserLoginInputSchema,
  RefreshTokenInputSchema,
} from '@/modules/auth/schemas/auth-input.schema.js';

export type UserRegisterInput = z.infer<typeof UserRegisterInputSchema>;
export type UserLoginInput = z.infer<typeof UserLoginInputSchema>;
export type RefreshTokenInput = z.infer<typeof RefreshTokenInputSchema>;
