import { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi';

import { healthRegistry } from '@/modules/health/routes/health.openapi.js';

// Combine all endpoint registries into a single registry
const registry = new OpenAPIRegistry([healthRegistry]);

export { registry };
