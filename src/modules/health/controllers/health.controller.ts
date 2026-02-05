import type { Request, Response } from 'express';
import type { HealthData } from '@modules/health/types/health.type.js';
import { HealthService } from '@modules/health/services/health.service.js';
import { ServiceResponse } from '@utils/http/service-response.util.js';
import { HTTP_STATUS } from '@core/utils/http/http-status.util.js';
import { asyncHandler } from '@core/utils/async-handler.util.js';
import {
  HealthDegradedResponseSchema,
  HealthSuccessResponseSchema,
} from '../schemas/health-response.schema.js';

const getHealth = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  // Get health data from the service layer
  const healthData: HealthData = await HealthService.getHealthStatus();

  // Decides the HTTP status code and message based on the data
  const isHealthy = healthData.status === 'healthy';
  const statusCode = isHealthy ? HTTP_STATUS.OK : HTTP_STATUS.SERVICE_UNAVAILABLE;
  const message = isHealthy
    ? 'Service is healthy - All systems operational'
    : 'Service unavailable - One or more checks failed';

  // Build the final HTTP response
  const serviceResponse = isHealthy
    ? ServiceResponse.success(message, healthData, statusCode)
    : ServiceResponse.failure(message, healthData, statusCode);

  // Output validation
  const validatedResponse = isHealthy
    ? HealthSuccessResponseSchema.parse(serviceResponse)
    : HealthDegradedResponseSchema.parse(serviceResponse);

  // Send the response
  res.status(validatedResponse.statusCode).json(validatedResponse);
});

export { getHealth };
