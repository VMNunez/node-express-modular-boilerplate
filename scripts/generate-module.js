#!/usr/bin/env node
/**
 * Scaffolds a new module following the boilerplate structure.
 * Usage: node scripts/generate-module.js <module-name>
 * Example: node scripts/generate-module.js product
 */

import fs from 'fs';
import path from 'path';

const moduleNameKebab = process.argv[2]?.toLowerCase().replace(/\s+/g, '-');
if (!moduleNameKebab || !/^[a-z][a-z0-9-]*$/.test(moduleNameKebab)) {
  console.error('Usage: node scripts/generate-module.js <module-name>');
  console.error('Example: node scripts/generate-module.js product');
  process.exit(1);
}

const moduleNamePascal = moduleNameKebab
  .split('-')
  .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
  .join('');
const baseDir = path.join(process.cwd(), 'src', 'modules', moduleNameKebab);

const dirs = ['controllers', 'repositories', 'routes', 'schemas', 'services', 'types', '__tests__'];

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function writeFile(filePath, content) {
  ensureDir(path.dirname(filePath));
  fs.writeFileSync(filePath, content, 'utf8');
  console.log('  Created', path.relative(process.cwd(), filePath));
}

// Create directories
dirs.forEach((d) => ensureDir(path.join(baseDir, d)));

// Controller
writeFile(
  path.join(baseDir, 'controllers', `${moduleNameKebab}.controller.ts`),
  `import type { Request, Response, NextFunction } from 'express';
import { ${moduleNamePascal}Service } from '@modules/${moduleNameKebab}/services/${moduleNameKebab}.service.js';
import { ServiceResponse } from '@utils/http/service-response.util.js';
import { HTTP_STATUS } from '@utils/http/http-status.util.js';

const service = new ${moduleNamePascal}Service();

export const get${moduleNamePascal} = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const data = await service.get();
    const response = ServiceResponse.success('Success', data, HTTP_STATUS.OK);
    res.status(response.statusCode).json(response);
  } catch (error) {
    next(error);
  }
};
`,
);

// Service
writeFile(
  path.join(baseDir, 'services', `${moduleNameKebab}.service.ts`),
  `import { ${moduleNamePascal}Repository } from '@modules/${moduleNameKebab}/repositories/${moduleNameKebab}.repository.js';

export class ${moduleNamePascal}Service {
  private repository = new ${moduleNamePascal}Repository();

  async get() {
    return this.repository.find();
  }
}
`,
);

// Repository
writeFile(
  path.join(baseDir, 'repositories', `${moduleNameKebab}.repository.ts`),
  `export class ${moduleNamePascal}Repository {
  async find() {
    return { message: 'Implement your data access here' };
  }
}
`,
);

// Input schema
writeFile(
  path.join(baseDir, 'schemas', `${moduleNameKebab}-input.schema.ts`),
  `import { z } from 'zod';

export const ${moduleNamePascal}InputSchema = z.object({
  // Define your input fields
});
`,
);

// Response schema
writeFile(
  path.join(baseDir, 'schemas', `${moduleNameKebab}-response.schema.ts`),
  `import { z } from 'zod';
import { HTTP_STATUS } from '@core/utils/http/http-status.util.js';
import { BaseResponseSchema } from '@/common/schemas/api-response.schema.js';

const ${moduleNamePascal}DataSchema = z.object({
  message: z.string(),
});

export const ${moduleNamePascal}SuccessResponseSchema = BaseResponseSchema.extend({
  success: z.literal(true),
  responseObject: ${moduleNamePascal}DataSchema,
  statusCode: z.literal(HTTP_STATUS.OK),
});
`,
);

// Types
writeFile(
  path.join(baseDir, 'types', `${moduleNameKebab}.type.ts`),
  `import type { z } from 'zod';
import { ${moduleNamePascal}InputSchema } from '@/modules/${moduleNameKebab}/schemas/${moduleNameKebab}-input.schema.js';

export type ${moduleNamePascal}Input = z.infer<typeof ${moduleNamePascal}InputSchema>;
`,
);

// Route
writeFile(
  path.join(baseDir, 'routes', `${moduleNameKebab}.route.ts`),
  `import express from 'express';
import type { Router } from 'express';
import { get${moduleNamePascal} } from '@modules/${moduleNameKebab}/controllers/${moduleNameKebab}.controller.js';

const ${moduleNameKebab}Router: Router = express.Router();

${moduleNameKebab}Router.get('/', get${moduleNamePascal});

export { ${moduleNameKebab}Router };
`,
);

// OpenAPI
writeFile(
  path.join(baseDir, 'routes', `${moduleNameKebab}.openapi.ts`),
  `import { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi';
import { HTTP_STATUS } from '@utils/http/http-status.util.js';
import { createApiResponse } from '@core/docs/openapi/openapi-response-builders.js';
import { ${moduleNamePascal}SuccessResponseSchema } from '@/modules/${moduleNameKebab}/schemas/${moduleNameKebab}-response.schema.js';
import { ErrorResponseSchema } from '@/common/schemas/api-response.schema.js';

const ${moduleNameKebab}Registry = new OpenAPIRegistry();

${moduleNameKebab}Registry.registerPath({
  method: 'get',
  path: '/api/${moduleNameKebab}',
  tags: ['${moduleNamePascal}'],
  responses: {
    ...createApiResponse(${moduleNamePascal}SuccessResponseSchema, 'Success', HTTP_STATUS.OK),
    ...createApiResponse(ErrorResponseSchema, 'Error', HTTP_STATUS.INTERNAL_SERVER_ERROR),
  },
});

export { ${moduleNameKebab}Registry };
`,
);

console.log(`\nModule "${moduleNameKebab}" scaffolded at src/modules/${moduleNameKebab}/\n`);
console.log('Next steps:');
console.log(`  1. Register routes in src/routes/index.ts:`);
console.log(
  `     import { ${moduleNameKebab}Router } from '@modules/${moduleNameKebab}/routes/${moduleNameKebab}.route.js';`,
);
console.log(`     router.use('/${moduleNameKebab}', ${moduleNameKebab}Router);`);
console.log(`  2. Register OpenAPI in src/core/docs/openapi/registries.ts:`);
console.log(
  `     import { ${moduleNameKebab}Registry } from '@/modules/${moduleNameKebab}/routes/${moduleNameKebab}.openapi.js';`,
);
console.log(`     const registry = new OpenAPIRegistry([..., ${moduleNameKebab}Registry]);`);
console.log('  3. Implement schemas, repository and business logic.\n');
