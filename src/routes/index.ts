import express from 'express';
import type { Router } from 'express';
import { healthRouter } from '@modules/health/routes/health.route.js';

const router: Router = express.Router();

router.use('/health', healthRouter);

export default router;
