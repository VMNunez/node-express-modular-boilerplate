import type { Request, Response, NextFunction } from 'express';
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

const authService = new AuthService();

export const register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const validatedData = UserRegisterInputSchema.parse(req.body);
    const result = await authService.register(validatedData);

    const serviceResponse = ServiceResponse.success(
      'User registered successfully',
      result,
      HTTP_STATUS.CREATED,
    );
    const validatedResponse = RegisterSuccessResponseSchema.parse(serviceResponse);
    res.status(validatedResponse.statusCode).json(validatedResponse);
  } catch (error) {
    next(error);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const validatedData = UserLoginInputSchema.parse(req.body);
    const result = await authService.login(validatedData);

    const serviceResponse = ServiceResponse.success('Login successful', result, HTTP_STATUS.OK);
    const validatedResponse = AuthSuccessResponseSchema.parse(serviceResponse);
    res.status(validatedResponse.statusCode).json(validatedResponse);
  } catch (error) {
    next(error);
  }
};

export const refresh = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const validatedData = RefreshTokenInputSchema.parse(req.body);
    const result = await authService.refresh(validatedData);

    const serviceResponse = ServiceResponse.success('Token refreshed', result, HTTP_STATUS.OK);
    const validatedResponse = RefreshSuccessResponseSchema.parse(serviceResponse);
    res.status(validatedResponse.statusCode).json(validatedResponse);
  } catch (error) {
    next(error);
  }
};

export const me = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const user = req.user;
    if (!user) {
      res
        .status(HTTP_STATUS.UNAUTHORIZED)
        .json(ServiceResponse.failure('Authentication required', null, HTTP_STATUS.UNAUTHORIZED));
      return;
    }
    res.status(HTTP_STATUS.OK).json(ServiceResponse.success('Current user', user, HTTP_STATUS.OK));
  } catch (error) {
    next(error);
  }
};
