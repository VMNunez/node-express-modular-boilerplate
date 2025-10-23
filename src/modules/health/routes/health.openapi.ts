import { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi';
import { HTTP_STATUS } from '@utils/http/http-status.util.js';
import { createApiResponse } from '@core/docs/openapi/openapi-response-builders.js';
import {
  HealthSuccessResponseSchema,
  HealthDegradedResponseSchema,
} from '@/modules/health/schemas/health-response.schema.js';
import { ErrorResponseSchema } from '@/common/schemas/api-response.schema.js';

// Create OpenAPI registry for documentation
const healthRegistry = new OpenAPIRegistry();

// OpenAPI configuration
healthRegistry.registerPath({
  method: 'get',
  path: '/api/health',
  tags: ['Health Check'],
  description: 'Comprehensive health check including database connection verification',
  responses: {
    ...createApiResponse(
      HealthSuccessResponseSchema,
      'Service is healthy - Successfully connected to database',
      HTTP_STATUS.OK,
    ),
    ...createApiResponse(
      HealthDegradedResponseSchema,
      'Service unavailable - Database connection failed',
      HTTP_STATUS.SERVICE_UNAVAILABLE,
    ),
    ...createApiResponse(
      ErrorResponseSchema,
      'Service is unhealthy - Internal server error',
      HTTP_STATUS.INTERNAL_SERVER_ERROR,
    ),
  },
});

export { healthRegistry };
