import { z } from 'zod';
import {
  ErrorResponseObjectSchema,
  ErrorResponseSchema,
  ValidationErrorDetailSchema,
} from '@common/schemas/api-response.schema.js';

type ValidationErrorDetail = z.infer<typeof ValidationErrorDetailSchema>;

type ErrorResponseObject = z.infer<typeof ErrorResponseObjectSchema>;

type ErrorResponse = z.infer<typeof ErrorResponseSchema>;

export type { ValidationErrorDetail, ErrorResponseObject, ErrorResponse };
