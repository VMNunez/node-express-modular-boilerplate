import express from 'express';
import type { Router } from 'express';
import { register, login, refresh } from '@modules/auth/controllers/auth.controller.js';

const authRouter: Router = express.Router();

authRouter.post('/register', register);
authRouter.post('/login', login);
authRouter.post('/refresh', refresh);

export { authRouter };
