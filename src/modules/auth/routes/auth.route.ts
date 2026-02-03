import express from 'express';
import type { Router } from 'express';
import { authMiddleware } from '@core/middlewares/auth.middleware.js';
import { register, login, refresh, me } from '@modules/auth/controllers/auth.controller.js';

const authRouter: Router = express.Router();

authRouter.post('/register', register);
authRouter.post('/login', login);
authRouter.post('/refresh', refresh);
authRouter.get('/me', authMiddleware, me);

export { authRouter };
