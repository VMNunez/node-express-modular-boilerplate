import express from 'express';
import type { Router } from 'express';
import { authRouter } from '@modules/auth/routes/auth.route.js';

const router: Router = express.Router();

router.use('/auth', authRouter);

export default router;
