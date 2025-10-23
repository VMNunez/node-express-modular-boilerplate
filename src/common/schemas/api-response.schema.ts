import { z } from 'zod';

// Base schema for the ServiceResponse structure
const BaseResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  responseObject: z.any(),
  statusCode: z.number(),
});

const ValidationErrorDetailSchema = z.object({
  path: z.string(),
  message: z.string(),
});

const ErrorResponseObjectSchema = z.object({
  stack: z.string().nullable().optional(),
  details: z.array(ValidationErrorDetailSchema).nullable().optional(),
});

// Extends the base schema for an error response
const ErrorResponseSchema = BaseResponseSchema.extend({
  success: z.literal(false),
  responseObject: ErrorResponseObjectSchema.nullable(),
});

export {
  BaseResponseSchema,
  ErrorResponseSchema,
  ErrorResponseObjectSchema,
  ValidationErrorDetailSchema,
};
