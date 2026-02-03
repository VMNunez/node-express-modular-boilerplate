import { z } from 'zod';
import { HTTP_STATUS } from '@core/utils/http/http-status.util.js';
import { BaseResponseSchema } from '@/common/schemas/api-response.schema.js';

// User without sensitive fields (for API responses)
const PublicUserSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  email: z.string().email(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

// Register / Login success data
const AuthSuccessDataSchema = z.object({
  user: PublicUserSchema,
  accessToken: z.string(),
  refreshToken: z.string(),
  expiresIn: z.string(),
});

const AuthSuccessResponseSchema = BaseResponseSchema.extend({
  success: z.literal(true),
  responseObject: AuthSuccessDataSchema,
  statusCode: z.literal(HTTP_STATUS.OK),
});

// Refresh success: new tokens only
const RefreshSuccessDataSchema = z.object({
  accessToken: z.string(),
  refreshToken: z.string(),
  expiresIn: z.string(),
});

const RefreshSuccessResponseSchema = BaseResponseSchema.extend({
  success: z.literal(true),
  responseObject: RefreshSuccessDataSchema,
  statusCode: z.literal(HTTP_STATUS.OK),
});

// Register created (201)
const RegisterSuccessResponseSchema = BaseResponseSchema.extend({
  success: z.literal(true),
  responseObject: z.object({ user: PublicUserSchema }),
  statusCode: z.literal(HTTP_STATUS.CREATED),
});

export {
  PublicUserSchema,
  AuthSuccessDataSchema,
  AuthSuccessResponseSchema,
  RefreshSuccessDataSchema,
  RefreshSuccessResponseSchema,
  RegisterSuccessResponseSchema,
};
