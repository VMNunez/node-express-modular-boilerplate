import type { Request, Response } from 'express';
import { AuthService } from '@modules/auth/services/auth.service.js';
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
import { ServiceResponse } from '@utils/http/service-response.util.js';
import { HTTP_STATUS } from '@utils/http/http-status.util.js';
import { asyncHandler } from '@core/utils/async-handler.util.js';

// Initialize the Auth service to handle business and database logic
const authService = new AuthService();

/**
 * Handles user registration.
 * Performs request body validation and ensures the service response
 * matches the RegisterSuccessResponseSchema before sending.
 */
export const register = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  // Validate incoming data using Zod
  const validatedData = UserRegisterInputSchema.parse(req.body);
  const result = await authService.register(validatedData);

  const serviceResponse = ServiceResponse.success(
    'User registered successfully',
    result,
    HTTP_STATUS.CREATED,
  );

  // Validate outgoing response to guarantee API contract consistency
  const validatedResponse = RegisterSuccessResponseSchema.parse(serviceResponse);
  res.status(validatedResponse.statusCode).json(validatedResponse);
});

/**
 * Handles user authentication (Login).
 * Returns access and refresh tokens if credentials are valid.
 */
export const login = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const validatedData = UserLoginInputSchema.parse(req.body);
  const result = await authService.login(validatedData);

  const serviceResponse = ServiceResponse.success('Login successful', result, HTTP_STATUS.OK);

  // Strict response validation to avoid leaking sensitive internal data
  const validatedResponse = AuthSuccessResponseSchema.parse(serviceResponse);
  res.status(validatedResponse.statusCode).json(validatedResponse);
});

/**
 * Handles token rotation.
 * Validates the refresh token and generates a new pair of JWTs.
 */
export const refresh = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const validatedData = RefreshTokenInputSchema.parse(req.body);
  const result = await authService.refresh(validatedData);

  const serviceResponse = ServiceResponse.success('Token refreshed', result, HTTP_STATUS.OK);

  const validatedResponse = RefreshSuccessResponseSchema.parse(serviceResponse);
  res.status(validatedResponse.statusCode).json(validatedResponse);
});

/**
 * Retrieves the currently authenticated user's profile.
 * Expects 'req.user' to be populated by the authMiddleware.
 */
export const me = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const user = req.user;

  // Manual check for 'req.user' as a safety fallback
  if (!user) {
    res
      .status(HTTP_STATUS.UNAUTHORIZED)
      .json(ServiceResponse.failure('Authentication required', null, HTTP_STATUS.UNAUTHORIZED));
    return;
  }

  res.status(HTTP_STATUS.OK).json(ServiceResponse.success('Current user', user, HTTP_STATUS.OK));
});
