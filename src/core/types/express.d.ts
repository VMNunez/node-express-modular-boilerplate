import 'express';
import type { AuthenticatedUser } from '@/common/types/auth.type.js';

declare module 'express-serve-static-core' {
  interface Request {
    id: string;
    startTime?: number;
    user?: AuthenticatedUser;
  }
}
