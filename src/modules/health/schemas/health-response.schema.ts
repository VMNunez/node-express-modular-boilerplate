import { HTTP_STATUS } from '@core/utils/http/http-status.util.js';
import { z } from 'zod';
import { BaseResponseSchema } from '@/common/schemas/api-response.schema.js';

const DatabaseMetricsSchema = z.object({
  dbConnected: z.boolean(),
  dbLatency: z.number().optional(),
});

// Defines the data structure for the 'responseObject' property in a successful health check
const HealthSucessDataSchema = z.object({
  status: z.literal('healthy'),
  timestamp: z.string(),
  uptime: z.number(),
  environment: z.string(),
  dependencies: DatabaseMetricsSchema,
});

// Extends the base schema for a successful health check response
const HealthSuccessResponseSchema = BaseResponseSchema.extend({
  success: z.literal(true),
  responseObject: HealthSucessDataSchema,
  statusCode: z.literal(HTTP_STATUS.OK),
});

// Defines the data structure for the 'responseObject' property in a egraded health check
const HealthDegradedDataSchema = z.object({
  status: z.literal('unhealthy'),
  timestamp: z.string(),
  uptime: z.number(),
  environment: z.string(),
  dependencies: DatabaseMetricsSchema,
});

// Extends the base schema for a degraded health check response
const HealthDegradedResponseSchema = BaseResponseSchema.extend({
  success: z.literal(false),
  responseObject: HealthDegradedDataSchema,
  statusCode: z.literal(HTTP_STATUS.SERVICE_UNAVAILABLE),
});

export {
  HealthSuccessResponseSchema,
  HealthDegradedResponseSchema,
  HealthSucessDataSchema,
  HealthDegradedDataSchema,
};
