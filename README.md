# Node.js Express Modular Architecture Boilerplate

A **production-ready**, **modular**, and **type-safe** Node.js boilerplate designed for **scalable APIs**.

![Node.js](https://img.shields.io/badge/Node.js-18+-green?logo=nodedotjs)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?logo=typescript)
![Express](https://img.shields.io/badge/Express-5.0-black?logo=express)
![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748?logo=prisma)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Database-336791?logo=postgresql)
![Vitest](https://img.shields.io/badge/Vitest-Testing-6E9F18?logo=vitest)
![License](https://img.shields.io/badge/License-ISC-blue)

A **highly scalable Node.js API starter** built with a **layered architecture**. It features a clean separation of concerns, strict TypeScript typing, integrated testing and linting, and a modular folder structure — everything you need to kick-start your next production-grade project.

---

## Table of Contents

- [Features](#features)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
- [Available Scripts](#available-scripts)
- [Development and API Documentation](#development-and-api-documentation)
  - [Development](#development)
  - [API Documentation](#api-documentation)
- [API Responses Format and Error Handling](#api-responses-format-and-error-handling)
- [Security](#security)
- [Code Conventions](#code-conventions)
- [Contributing](#contributing)
- [Author](#author)

---

## Features

- **Modular Architecture** — Domain-based structure with clear vertical layering
  (Controller → Service → Repository), ensuring scalability and separation of concerns.
- **TypeScript** — Full type safety across the entire stack for more reliable development.
- **Zod Validation** — Runtime and compile-time schema validation with strong typing guarantees.
- **Prisma ORM** — Type-safe database access with migrations, relations, and seeding support.
- **OpenAPI Documentation** — Automatic Swagger generation with modular registry integration.
- **Vitest Testing** — Fast, modern, and isolated testing environment.
- **ESLint + Prettier** — Enforced code style and formatting consistency.
- **Husky + Commitlint** — Git hooks to ensure clean commits and maintain code quality.
- **Security** — Built-in protection with Helmet, CORS, and rate limiting.
- **Environment Configuration** — Isolated dev, test, and production environments via `.env` and validation schemas.

---

## Project Structure

This structure ensures **clear separation of concerns**, making it easy to add new modules or scale the application without mixing unrelated logic. Below is the folder structure:

```
src/
├── common/ # Shared utilities and global schemas/types
│   ├── schemas/ # Global Zod schemas used across modules
│   └── types/ # Shared TypeScript types/interfaces
├── core/ # Core infrastructure and application-level logic
│   ├── config/ # Environment-based configuration
│   ├── database/ # Prisma client and database setup
│   ├── docs/ # OpenAPI documentation utilities and registries
│   ├── middlewares/ # Global Express middlewares (error handling, auth, etc.)
│   └── utils/ # Shared utility functions and helpers
├── modules/ # Business domain modules
│   └── health/ # Example module
│       ├── __tests__/ # Module-specific tests
│       ├── controllers/ # HTTP request handling
│       ├── repositories/ # Data access layer
│       ├── routes/ # Module-specific Express routes
│       ├── schemas/ # Input/output Zod schemas
│       ├── services/ # Business logic layer
│       └── types/ # Module-specific TypeScript types
├── routes/ # Centralized routes registry for all modules
├── app.ts # Main Express application
└── server.ts # Server bootstrap and configuration
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL (or any Prisma-supported database)

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd node-express-modular-boilerplate

   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Create database**

   Create a new database in your preferred database system. This project supports:
   - **PostgreSQL**
   - **MySQL**
   - **SQLite**
   - **SQL Server**
   - **MongoDB**

4. **Configure database provider**

   Update prisma/schema.prisma to match your database:

   ```typescript
   generator client {
     provider = "prisma-client-js"
   }

   datasource db {
     provider = "postgresql" // <- IMPORTANT: Change this line if you are NOT using PostgreSQL.(e.g: "mysql", "sqlite", "sqlserver", or "mongodb")
     url      = env("DATABASE_URL")
   }
   ```

5. **Configure environment variables**

   Copy the environment template

   ```bash
   cp .env.template .env
   ```

   Edit .env with your configurations:

   ```bash
    # Runtime Environment
    NODE_ENV="development"

    # Server Configuration
    PORT="8080"
    HOST="localhost"

    # PostgreSQL Connection (replace with your actual credentials)
    DATABASE_URL="postgresql://username:password@localhost:5432/your_database_name?schema=public"

    # Allowed origins (comma-separated for multiple domains)
    CORS_ORIGIN="http://localhost:3000,http://localhost:8080"

    # JWT (use strong 32+ character secrets in production)
    JWT_ACCESS_SECRET="your-access-secret-at-least-32-characters-long"
    JWT_REFRESH_SECRET="your-refresh-secret-at-least-32-characters-long"
    JWT_ACCESS_EXPIRES_IN="15m"
    JWT_REFRESH_EXPIRES_IN="7d"
   ```

6. **Setup database**

   ```bash
   # Generate Prisma client
   npm run db:generate

   # Run migrations
   npm run db:migrate

   # Seed sample data (optional) — creates a demo user for testing auth
   npm run db:seed
   # Demo login: demo@example.com / password123
   ```

7. **Run the application**

   ```bash
   # Development
   npm run dev

   # Production
   npm run build
   npm start
   ```

### Path aliases (TypeScript)

Imports use path aliases so you don't rely on relative paths. Configured in `tsconfig.json`:

| Alias            | Resolves to              |
| ---------------- | ------------------------ |
| `@/*`            | `src/*`                  |
| `@core/*`        | `src/core/*`             |
| `@common/*`      | `src/common/*`           |
| `@config/*`      | `src/core/config/*`      |
| `@modules/*`     | `src/modules/*`          |
| `@routes/*`      | `src/routes/*`           |
| `@utils/*`       | `src/core/utils/*`       |
| `@docs/*`        | `src/core/docs/*`        |
| `@middlewares/*` | `src/core/middlewares/*` |
| `@tests/*`       | `tests/*`                |

Use the `.js` extension in import paths when targeting Node (e.g. `@modules/auth/services/auth.service.js`).

### Common pitfalls

- **Invalid environment variables**: If the app fails at startup with "Invalid environment variables", check that all required vars in `.env` match `env.schema.ts` (e.g. `JWT_ACCESS_SECRET` at least 32 characters, `CORS_ORIGIN` valid URL(s)).
- **Database not migrated**: Run `npm run db:migrate` after cloning or changing the Prisma schema.
- **CORS issues**: Ensure `CORS_ORIGIN` includes the exact origin your frontend uses (including port). Comma-separated values are supported.

---

## Available Scripts

| Command                             | Description                            |
| ----------------------------------- | -------------------------------------- |
| `npm run dev`                       | Run in development mode                |
| `npm run build`                     | Build TypeScript to JavaScript         |
| `npm start`                         | Run application in production          |
| `npm test`                          | Run tests with Vitest                  |
| `npm run test:coverage`             | Run tests with coverage report         |
| `npm run lint`                      | Run ESLint to check code               |
| `npm run lint-fix`                  | Run ESLint and fix errors              |
| `npm run format`                    | Format code with Prettier              |
| `npm run check-format`              | Check code formatting without fixing   |
| `npm run prepare`                   | Setup Git hooks with Husky             |
| `npm run db:generate`               | Generate Prisma client                 |
| `npm run db:migrate`                | Run database migrations                |
| `npm run db:migrate:deploy`         | Deploy migrations                      |
| `npm run db:studio`                 | Open Prisma Studio for data management |
| `npm run db:reset`                  | Reset database                         |
| `npm run db:seed`                   | Seed database with sample data         |
| `npm run generate:module -- <name>` | Scaffold a new module (e.g. `product`) |

### Testing

- **Unit tests**: `npm test` runs Vitest for all `src/**/__tests__/**/*.test.ts` and `tests/**/*.test.ts`. Use `npm run test:coverage` for coverage.
- **E2E (auth)**: The suite in `tests/e2e/auth.e2e.test.ts` runs without a database by default (middleware and validation tests). To run **full E2E** (register, login, protected route with real DB), set `E2E_USE_DATABASE=1` and ensure `.env.test` has a valid `DATABASE_URL`, then run `npm test`.

---

## Development and API Documentation

### Development

Follow this step-by-step guide to create a new module that adheres to our architecture principles.

1.  **Create folder structure for your new module:**

    Establish the foundation for your new module by creating the standardized folder structure that ensures separation of concerns and maintainability.

    **Option A — Generate with script (recommended):**

    ```bash
    npm run generate:module -- product
    ```

    This creates `src/modules/product/` with controllers, services, repositories, schemas, types, routes, and OpenAPI stubs. Then register the module in `src/routes/index.ts` and `src/core/docs/openapi/registries.ts` as printed by the script.

    **Option B — Create manually:**

    ```
    src/
    ├── common/
    ├── core/
    ├── modules/
    │     └── example/
    │         ├── __tests__/
    │         ├── controllers/
    │         │   └── example.controller.ts
    │         ├── repositories/
    │         │   └── example.repository.ts
    │         ├── routes/
    │         │   ├── example.openapi.ts
    │         │   └── example.route.ts
    │         ├── schemas/
    │         │   ├── example-input.schema.ts
    │         │   └── example-response.schema.ts
    │         ├── services/
    │         │   └── example.service.ts
    │         └── types/
    │           └── example.type.ts
    ├── routes/
    │     └── index.ts
    ├── app.ts
    └── server.ts
    ```

2.  **Define validation schemas:**

    Implement Zod schemas for your module to enforce data integrity and define the shape of requests and responses

    **Input validation schemas:**

    Define the schema for validating incoming request data to ensure it meets business requirements before processing

    ```typescript
    // schemas/example-input.schema.ts
    import { z } from 'zod';

    // Defines the data structure for incoming request payloads
    const ExampleInputSchema = z.object({
      title: z.string().min(3, 'Title is required and must be at least 3 characters long'),
      description: z.string().optional(),
      active: z.boolean().default(true),
    });

    export { ExampleInputSchema };
    ```

    **API response schemas:**

    Define the schema for structuring API responses to maintain consistency across all endpoints and generate comprehensive OpenAPI documentation

    ```typescript
    // schemas/example-response.schema.ts
    import { z } from 'zod';
    import { HTTP_STATUS } from '@core/utils/http/http-status.util.js';
    import { BaseResponseSchema } from '@common/schemas/api-response.schema.js';

    // Defines the data structure for the 'responseObject' property in a successful response
    const ExampleSuccessDataSchema = z.object({
      status: z.literal('healthy'),
      timestamp: z.string(),
      uptime: z.number(),
    });

    // Extends the base schema for a successful health check response
    const ExampleSuccessResponseSchema = BaseResponseSchema.extend({
      success: z.literal(true),
      responseObject: ExampleSuccessDataSchema,
      statusCode: z.literal(HTTP_STATUS.OK),
    });

    export { ExampleSuccessDataSchema, ExampleSuccessResponseSchema };
    ```

3.  **Infer types:**

    Use Zod to automatically infer TypeScript types from your validation schemas, maintaining a single source of truth and ensuring consistency between runtime validation and static typing

    ```typescript
    // types/example.type.ts
    import { z } from 'zod';
    import { ExampleInputSchema } from '@modules/example/schemas/example-input.schema.js';
    import {
      ExampleSuccessDataSchema,
      ExampleSuccessResponseSchema,
    } from '@modules/example/schemas/example-response.schema.js';

    // Infer input types from schemas
    export type ExampleInput = z.infer<typeof ExampleInputSchema>;

    // Infer response types from schemas
    export type ExampleData = z.infer<typeof ExampleSuccessDataSchema>;
    export type ExampleSuccessResponse = z.infer<typeof ExampleSuccessResponseSchema>;
    ```

4.  **Implement repository:**

    Create a data access layer that encapsulates all database operations for this module

    ```typescript
    // repositories/example.repository.ts
    import { prisma } from '@core/database/prisma.client.js';
    import type { ExampleInput } from '@modules/example/types/example.type.js';

    export class ExampleRepository {
      async saveNew(data: ExampleInput) {
        // Ensure the 'example' model exists in your Prisma schema
        return prisma.example.create({ data });
      }
    }
    ```

5.  **Implement service:**

    Create a service layer that handles business logic and coordinates interactions with the repository.

    ```typescript
    // services/example.service.ts
    import { ExampleRepository } from '@modules/example/repositories/example.repository.js';
    import type { ExampleInput, ExampleData } from '@modules/example/types/example.type.js';

    export class ExampleService {
      private exampleRepository = new ExampleRepository();

      async createExample(data: ExampleInput): Promise<ExampleData> {
        return this.exampleRepository.saveNew(data);
      }
    }
    ```

6.  **Implement controller:**

    Implement the HTTP adapter layer. It handles request validation, calls the Service, and returns a standardized API response or passes errors to the global error handler

    ```typescript
    // controllers/example.controller.ts
    import type { Request, Response, NextFunction } from 'express';
    import { ExampleService } from '@modules/example/services/example.service.js';
    import { ExampleInputSchema } from '@modules/example/schemas/example-input.schema.js';
    import { ExampleSuccessResponseSchema } from '@modules/example/schemas/example-response.schema.js';
    import { ServiceResponse } from '@core/utils/http/service-response.util.js';
    import { HTTP_STATUS } from '@core/utils/http/http-status.util.js';

    const exampleService = new ExampleService();

    export const exampleController = async (req: Request, res: Response, next: NextFunction) => {
      try {
        // Validate the incoming request body against the Zod input schema.
        const validatedData = ExampleInputSchema.parse(req.body);

        // Call the Service layer to execute business logic
        const result = await exampleService.createExample(validatedData);

        // Construct and return a standardized success response
        const serviceResponse = ServiceResponse.success(
          'Example created successfully',
          result,
          HTTP_STATUS.CREATED,
        );

        // Output Validation
        ExampleSuccessResponseSchema.parse(serviceResponse);

        // Send the final HTTP response
        res.status(serviceResponse.statusCode).json(serviceResponse);
      } catch (error) {
        // Pass any error to the centralized error handler
        next(error);
      }
    };
    ```

7.  **Define the API route:**

    Set up Express routes that connect your controller to specific HTTP endpoints

    ```typescript
    // routes/example.route.ts
    import express from 'express';
    import type { Router } from 'express';
    import { exampleController } from '@modules/example/controllers/example.controller.js';

    const exampleRouter = express.Router();

    exampleRouter.post('/', exampleController);

    export { exampleRouter };
    ```

8.  **Register module in main router:**

    Register your module routes in the central routes/index.ts file where all application routes are consolidated. This ensures your endpoints are available under the /api base path defined in server.ts. Once registered, your module's routes are fully exposed. For instance, if your module defines a POST /example endpoint, it will be immediately accessible to clients at the full path: POST /api/example

    ```typescript
    // routes/index.ts
    import express from 'express';
    import type { Router } from 'express';
    import { exampleRouter } from '@modules/example/routes/example.route.js';

    const router: Router = express.Router();

    router.use('/example', exampleRouter);

    export default router;
    ```

9.  **Create OpenAPI Documentation**

    Define OpenAPI specifications for your endpoint to generate comprehensive API documentation with Swagger

    ```typescript
    // routes/example.openapi.ts
    import { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi';
    import { HTTP_STATUS } from '@core/utils/http/http-status.util.js';
    import { createApiResponse } from '@core/docs/openapi/openapi-response-builders.js';
    import { ExampleSuccessResponseSchema } from '@modules/example/schemas/example-response.schema.js';
    import { ErrorResponseSchema } from '@common/schemas/api-response.schema.js';

    // Create OpenAPI registry for documentation
    const exampleRegistry = new OpenAPIRegistry();

    // OpenAPI configuration
    exampleRegistry.registerPath({
      method: 'post',
      path: '/api/example',
      tags: ['Example'],
      summary: 'Create a new example',
      description: 'Creates a new example resource in the system with validated input data',
      responses: {
        // Use createApiResponse to build standardized OpenAPI responses
        ...createApiResponse(
          ExampleSuccessResponseSchema,
          'Example created successfully',
          HTTP_STATUS.CREATED,
        ),
        ...createApiResponse(
          ErrorResponseSchema,
          'Invalid input data - validation failed',
          HTTP_STATUS.BAD_REQUEST,
        ),
      },
    });

    export { exampleRegistry };
    ```

10. **Register OpenAPI in documentation system:**

    Add your module's OpenAPI registry to the central documentation system located in src/core/docs/openapi/registries to include it in the generated Swagger documentation

    ```typescript
    // src/core/docs/openapi/registries/example.registry.ts
    import { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi';
    import { exampleRegistry } from '@modules/example/routes/example.openapi.js';

    // Combine all endpoint registries into a single registry
    const registry = new OpenAPIRegistry([exampleRegistry]);

    export { registry };
    ```

### API Documentation

Once you have completed module development and registered your OpenAPI specifications, the system automatically generates comprehensive, interactive API documentation powered by Swagger UI

#### Accessing the Documentation

After starting the application (by running `npm run dev`), you can access the documentation at:

```bash
http://localhost:8080/api-docs
```

**Note:** The actual port may vary depending on your application configuration (commonly 3000, 8080, or 5000). Check your `.env` file configuration for the `PORT` environment variable to confirm the correct value.

#### Example HTTP requests

The `http/` folder contains sample requests (VS Code REST Client, or similar):

- `http/health.http` — Health check.
- `http/auth-register.http` — User registration.
- `http/auth-login.http` — Login and refresh token.
- `http/auth-protected.http` — Example request with `Authorization: Bearer <token>`.

### What Gets Automatically Generated

The documentation system automatically consolidates all registered OpenAPI registries under `src/core/docs/openapi/registries`
Each module contributes its own `*.openapi.ts` file, which defines the endpoints, schemas, and standardized responses

- **Endpoint definitions** – Imported from your module’s \*.openapi.ts file

- **Request/Response schemas** – Generated from Zod validation schemas

- **Standardized responses** – Created via the shared createApiResponse utility

- **Error models** – Referenced from ErrorResponseSchema for consistency across all modules

This ensures:

- Every API route is fully documented and validated

- All response formats adhere to the unified ServiceResponse structure

- Schema changes automatically propagate to both runtime validation and documentation

### Example Integration Flow

1. **Definition**: Define the module’s OpenAPI registry in `@modules/example/routes/example.openapi.ts` using `createApiResponse` for consistent schemas and metadata.
2. **Central Registration**: Add the registry to `@core/docs/openapi/registries.ts` so the global generator includes it automatically.
3. **Compilation**: The central generator (`openapi-document-generator.ts`) merges all module registries into a single OpenAPI 3.0 specification (`swagger.json`).
4. **Rendering**: The server exposes the generated spec, and Swagger UI renders it interactively at `/api-docs`.

---

## API Responses Format and Error Handling

The application uses a standardized response format across all endpoints to ensure consistency and predictability

### Success response

All successful API calls return a standardized response, wrapping the module-specific result data inside the `responseObject` property

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "responseObject": {
    // Module-specific data structure
    "id": "123",
    "status": "healthy",
    "timestamp": "2023-10-05T12:00:00.000Z",
    "uptime": 3600
  },
  "statusCode": 200
}
```

### Error responses

Error responses adapt dynamically based on the current NODE_ENV, providing detailed stack traces during development and secure, minimal output in production

**Error Handling System**

The project includes a robust, centralized error handling system that ensures consistent error responses across the entire application. All issues are categorized into four main types: Business Logic Errors, Validation Errors, JWT Errors, and Generic Errors

**1. Business Logic Errors**

Controlled application errors (ApiError) thrown intentionally for specific business scenarios, such as 400 Bad Request (Invalid Operations), 401 Unauthorized (Authentication Failures), 403 Forbidden (Permission Violations), 404 Not Found (Missing Resources), and 409 Conflict (Resource Duplication)

These errors can be intentionally thrown when necessary using the ApiError factory methods

```typescript
// Throw controlled, expected errors for business logic
throw ApiError.notFound('User not found');
throw ApiError.badRequest('Invalid email format');
throw ApiError.unauthorized('Authentication required');
throw ApiError.forbidden('Access denied');
throw ApiError.conflict('Resource already exists');
```

The resulting error response will depend on the environment

- **Development environment**

  Includes the full stack trace to help developers identify where in the codebase the business rule was enforced or violated

  ```json
  {
    "success": false,
    "message": "Resource not found",
    "responseObject": {
      "stack": "ApiError: Resource not found at /path/to/controller.ts:15:10",
      "details": null
    },
    "statusCode": 404
  }
  ```

- **Production environment**

  Returns only the business-oriented error message without technical details, providing clear feedback to clients while maintaining security

  ```json
  {
    "success": false,
    "message": "Resource not found",
    "responseObject": null,
    "statusCode": 404
  }
  ```

**2. Validation Errors**

Validation Errors are generated when client input fails Zod schema validation

These errors are automatically thrown when Zod schema validation fails

```typescript
import { ExampleInputSchema } from '@modules/example/schemas/example-input.schema.js';

// This will automatically throw ZodError if validation fails
const validatedData = ExampleInputSchema.parse(req.body);
```

These error responses are characterized by the mandatory presence of a details array containing field-specific issues, though the inclusion of the server's execution stack trace is conditional based on the environment

- **Development environment**

  The full error stack trace is included within responseObject for easy, direct debugging of the validation failure origin

  ```json
  {
    "success": false,
    "message": "Validation failed",
    "responseObject": {
      "stack": "Error: Validation failed at /path/to/file.ts:25:15 at ...",
      "details": [
        {
          "path": "email",
          "message": "Invalid email format"
        }
      ]
    },
    "statusCode": 422
  }
  ```

- **Production environment**

  To prevent information leakage, the sensitive stack trace is omitted. Only the necessary validation details are returned to the client

  ```json
  {
    "success": false,
    "message": "Validation failed",
    "responseObject": {
      "details": [
        {
          "path": "email",
          "message": "Invalid email format"
        }
      ]
    },
    "statusCode": 422
  }
  ```

**3. JWT Errors**

Authentication-specific errors related to JSON Web Token validation failures, including invalid tokens, expired tokens, and malformed authentication headers

These errors are automatically thrown by the authentication middleware when JWT validation fails

```typescript
// JWT errors are automatically thrown by auth middleware
// Example of what happens internally in your JWT middleware:
import jwt from 'jsonwebtoken';

const token = req.headers.authorization?.split(' ')[1];

if (!token) {
  throw ApiError.unauthorized('Authentication required');
}

try {
  const decoded = jwt.verify(token, process.env.JWT_SECRET!);
  // ... proceed if valid
} catch (error) {
  // This will automatically throw JWT errors caught by error handler
  // - JsonWebTokenError for invalid tokens
  // - TokenExpiredError for expired tokens
  next(error);
}
```

- **All environments**

  Returns a secure error message without exposing token-specific details that could aid attackers

  ```json
  {
    "success": false,
    "message": "Invalid or expired token",
    "responseObject": null,
    "statusCode": 401
  }
  ```

**4. Generic Errors**

These errors represent unexpected failures, such as unhandled exceptions, database connection timeouts, or critical internal logic errors

These errors occur in several scenarios

```typescript
// 1. Using next(error) in catch blocks
try {
  const result = await someAsyncOperation();
} catch (error) {
  next(error); // Will be caught as Generic Error
}

// 2. Throwing generic errors
throw new Error('Database connection failed');

// 3. Unhandled promise rejections
await Promise.reject(new Error('Async operation failed'));

// 4. Uncaught exceptions
undefinedFunction(); // ReferenceError caught as Generic Error
```

The response behavior depends on the environment

- **Development environment**

  Includes the original error message and full stack trace for debugging

  ```json
  {
    "success": false,
    "message": "Database connection timeout",
    "responseObject": {
      "stack": "Error: Connection timeout at /path/to/database.ts:45:20 at ...",
      "details": null
    },
    "statusCode": 500
  }
  ```

- **Production environment**

  Returns a generic message and sets responseObject to null to prevent information leakage

  ```json
  {
    "success": false,
    "message": "Internal server error",
    "responseObject": null,
    "statusCode": 500
  }
  ```

### Error Propagation Flow

All application errors — whether intentionally thrown or resulting from validation, authentication, or unexpected runtime issues — are centrally managed by the `errorHandlerMiddleware`

Whenever a controller or service encounters an issue, it should either:

- Throw a controlled `ApiError` for predictable business scenarios, or
- Pass the error to the middleware chain using `next(error)` to ensure consistent handling

The `errorHandlerMiddleware` acts as the single entry point for error classification and response formatting
It analyzes the error type (Business, Validation, JWT, or Generic), constructs a standardized `ServiceResponse` object, and returns it to the client with the appropriate HTTP status code and environment-aware details

---

## Security

The project integrates multiple layers of security to protect both the API and its consumers

- **Helmet**: Adds HTTP security headers to prevent common web vulnerabilities such as XSS, clickjacking, and MIME sniffing
- **CORS**: Configurable cross-origin resource sharing rules, allowing explicit domain whitelisting through environment variables
- **Rate Limiting**: Uses express-rate-limit to mitigate brute-force and DDoS attacks by enforcing per-IP request quotas
- **JWT Authentication**: Stateless authentication using JSON Web Tokens, including automatic token validation, expiration handling, and secure secret management via environment variables
- **Input Validation**: Strict and type-safe schema validation with Zod, preventing malformed or malicious payloads
- **Environment Isolation**: Sensitive configuration (e.g., credentials, tokens, secrets) is fully isolated using .env files and validated via a centralized schema
- **Error Sanitization**: The error handler dynamically redacts sensitive details in production, exposing full stack traces only in development

### JWT Authentication

The API uses JWT for stateless auth. Configure these in `.env` (see [Getting Started](#getting-started)):

| Variable                 | Description                                       |
| ------------------------ | ------------------------------------------------- |
| `JWT_ACCESS_SECRET`      | Secret to sign access tokens (min 32 characters). |
| `JWT_REFRESH_SECRET`     | Optional; defaults to access secret if omitted.   |
| `JWT_ACCESS_EXPIRES_IN`  | Access token TTL (e.g. `15m`, `1h`).              |
| `JWT_REFRESH_EXPIRES_IN` | Refresh token TTL (e.g. `7d`).                    |

**Endpoints**

- `POST /api/auth/register` — Register (body: `name`, `email`, `password`).
- `POST /api/auth/login` — Login (body: `email`, `password`). Returns `accessToken`, `refreshToken`, `user`.
- `POST /api/auth/refresh` — Refresh tokens (body: `refreshToken`).

**Using the token**

Send the access token in the header:

```http
Authorization: Bearer <your-access-token>
```

**Protecting a route**

Use the auth middleware from core and attach it to routes that require a valid JWT:

```typescript
import { authMiddleware } from '@core/middlewares/auth.middleware.js';

// Protected route: req.user is set after JWT verification
router.get('/me', authMiddleware, (req, res) => {
  res.json({ user: req.user });
});
```

### Authentication Middleware

All protected routes use a centralized JWT authentication middleware that:

- Extracts and verifies the `Authorization: Bearer <token>` header.
- Automatically rejects expired or invalid tokens with standardized 401 responses.
- Injects the authenticated user context (`req.user`) into downstream handlers.

### CORS

`CORS_ORIGIN` accepts a **single URL** or **comma-separated list** (e.g. `http://localhost:3000,http://localhost:8080`). Each value must be a valid URL.

---

## Code Conventions

- **File names**: kebab-case (`user-repository.ts`)
- **Classes / Controllers / Repositories / Services**: PascalCase (`UserRepository`, `UserController`, `UserService`)
- **Variables / Functions**: camelCase (`getUserById`)
- **Interfaces / Types / Schemas**: PascalCase (`UserResponse`, `CreateUserSchema`)
- **Constants**: UPPER_CASE (`MAX_USERS`)

---

## Contributing

Contributions are welcome! Please follow these steps to submit your changes:

1. Fork the repository.
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes with a clear message: `git commit -m 'Add amazing feature'`
4. Push the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request and describe your changes.

---

## Author

**Víctor Manuel Núñez Pradas** – [GitHub](https://github.com/VMNunez)

---

Found this boilerplate useful? Give it a ⭐ on GitHub!
