import { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi';
import { HTTP_STATUS } from '@utils/http/http-status.util.js';
import { createApiResponse } from '@core/docs/openapi/openapi-response-builders.js';
import {
  UserRegisterInputSchema,
  UserLoginInputSchema,
  RefreshTokenInputSchema,
} from '@modules/auth/schemas/auth-input.schema.js';
import {
  RegisterSuccessResponseSchema,
  AuthSuccessResponseSchema,
  RefreshSuccessResponseSchema,
} from '@modules/auth/schemas/auth-response.schema.js';
import { ErrorResponseSchema } from '@/common/schemas/api-response.schema.js';

const authRegistry = new OpenAPIRegistry();

const errorResponses = (tag: string) => ({
  ...createApiResponse(ErrorResponseSchema, 'Validation failed', HTTP_STATUS.UNPROCESSABLE_ENTITY),
  ...createApiResponse(
    ErrorResponseSchema,
    'Conflict or invalid credentials',
    HTTP_STATUS.CONFLICT,
  ),
  ...createApiResponse(ErrorResponseSchema, 'Unauthorized', HTTP_STATUS.UNAUTHORIZED),
});

authRegistry.registerPath({
  method: 'post',
  path: '/api/auth/register',
  tags: ['Auth'],
  summary: 'Register a new user',
  request: {
    body: {
      content: {
        'application/json': {
          schema: UserRegisterInputSchema,
        },
      },
    },
  },
  responses: {
    ...createApiResponse(
      RegisterSuccessResponseSchema,
      'User registered successfully',
      HTTP_STATUS.CREATED,
    ),
    ...errorResponses('register'),
  },
});

authRegistry.registerPath({
  method: 'post',
  path: '/api/auth/login',
  tags: ['Auth'],
  summary: 'Login with email and password',
  request: {
    body: {
      content: {
        'application/json': {
          schema: UserLoginInputSchema,
        },
      },
    },
  },
  responses: {
    ...createApiResponse(AuthSuccessResponseSchema, 'Login successful', HTTP_STATUS.OK),
    ...errorResponses('login'),
  },
});

authRegistry.registerPath({
  method: 'post',
  path: '/api/auth/refresh',
  tags: ['Auth'],
  summary: 'Refresh access token',
  request: {
    body: {
      content: {
        'application/json': {
          schema: RefreshTokenInputSchema,
        },
      },
    },
  },
  responses: {
    ...createApiResponse(RefreshSuccessResponseSchema, 'Token refreshed', HTTP_STATUS.OK),
    ...errorResponses('refresh'),
  },
});

export { authRegistry };
