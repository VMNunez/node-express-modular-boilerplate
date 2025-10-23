import express, { type Request, type Response, type Router } from 'express';
import swaggerUi from 'swagger-ui-express';
import { generateOpenAPIDocument } from '@core/docs/openapi/openapi-document-generator.js';

// Create Express router for OpenAPI documentation endpoints
export const openAPIRouter: Router = express.Router();

// Generate OpenAPI document once at startup
const openAPIDocument = generateOpenAPIDocument();

// Endpoint to serve raw OpenAPI JSON specification
// Used by tools that need machine-readable API definition
openAPIRouter.get('/swagger.json', (_req: Request, res: Response) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(openAPIDocument);
});

// Serve Swagger UI interactive documentation at root path
// Provides web interface for exploring and testing API endpoints
openAPIRouter.use('/api-docs', swaggerUi.serve, swaggerUi.setup(openAPIDocument));
