import type { AccessTokenPayload } from '@core/auth/jwt.util.js';

/**
 * User context attached to req after JWT verification.
 * Use this type for req.user in protected routes.
 */
export type AuthenticatedUser = AccessTokenPayload;
