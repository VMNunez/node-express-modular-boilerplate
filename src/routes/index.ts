import express from 'express';
import type { Router } from 'express';
import { healthRouter } from '@modules/health/routes/health.route.js';
import { authRouter } from '@modules/auth/routes/auth.route.js';

const router: Router = express.Router();

router.use('/health', healthRouter);
router.use('/auth', authRouter);

export default router;
