import express from 'express';
import type { Router } from 'express';
import { getHealth } from '@modules/health/controllers/health.controller.js';

// Create Express router for health check endpoint
const healthRouter: Router = express.Router();

// Endpoint implementation
healthRouter.get('/', getHealth);

export { healthRouter };
