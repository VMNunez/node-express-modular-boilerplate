import { OpenApiGeneratorV3 } from '@asteasolutions/zod-to-openapi';
import { registry } from '@docs/openapi/registries.js';

// Type definition for the generated OpenAPI document
export type OpenAPIDocument = ReturnType<OpenApiGeneratorV3['generateDocument']>;

// Main function that generates the complete OpenAPI documentation
export function generateOpenAPIDocument(): OpenAPIDocument {
  // Create generator instance with all registered endpoint definitions
  const generator = new OpenApiGeneratorV3(registry.definitions);

  // Generate and return the complete OpenAPI documentation
  return generator.generateDocument({
    openapi: '3.0.0',
    info: {
      version: '1.0.0',
      title: 'Swagger API',
    },
    externalDocs: {
      description: 'View the raw OpenAPI Specification in JSON format',
      url: '/swagger.json', // Link to raw JSON specification
    },
  });
}
