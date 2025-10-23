import { z } from 'zod';
import {
  HealthDegradedDataSchema,
  HealthSucessDataSchema,
} from '@/modules/health/schemas/health-response.schema.js';

export type HealthData =
  | z.infer<typeof HealthSucessDataSchema>
  | z.infer<typeof HealthDegradedDataSchema>;
