import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import app from '@/server.js';
import { prisma } from '@core/database/prisma.client.js';

const uniqueEmail = () => `e2e-${Date.now()}-${Math.random().toString(36).slice(2, 9)}@example.com`;

/** Set E2E_USE_DATABASE=1 when a test DB is available to run register/login/me E2E tests. */
const useDb = process.env.E2E_USE_DATABASE === '1';

describe('Auth E2E', () => {
  let testEmail: string;
  let testPassword: string;

  beforeAll(() => {
    testEmail = uniqueEmail();
    testPassword = 'password123';
  });

  afterAll(async () => {
    if (useDb) {
      await prisma.user.deleteMany({ where: { email: { startsWith: 'e2e-' } } }).catch(() => {});
    }
  });

  describe('POST /api/auth/register', () => {
    it.skipIf(!useDb)(
      'should register a new user and return 201 with user (no passwordHash)',
      async () => {
        const res = await request(app)
          .post('/api/auth/register')
          .send({
            name: 'E2E User',
            email: testEmail,
            password: testPassword,
          })
          .expect(201);

        expect(res.body.success).toBe(true);
        expect(res.body.message).toBe('User registered successfully');
        expect(res.body.statusCode).toBe(201);
        expect(res.body.responseObject).toHaveProperty('user');
        expect(res.body.responseObject.user).toMatchObject({
          name: 'E2E User',
          email: testEmail,
        });
        expect(res.body.responseObject.user).toHaveProperty('id');
        expect(res.body.responseObject.user).toHaveProperty('createdAt');
        expect(res.body.responseObject.user).toHaveProperty('updatedAt');
        expect(res.body.responseObject.user).not.toHaveProperty('passwordHash');
      },
    );

    it('should return 422 when validation fails (short password)', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'E2E User',
          email: uniqueEmail(),
          password: 'short',
        })
        .expect(422);

      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('Validation failed');
      expect(res.body.responseObject?.details).toBeDefined();
    });

    it.skipIf(!useDb)('should return 409 when email is already registered', async () => {
      await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Duplicate',
          email: testEmail,
          password: testPassword,
        })
        .expect(409);
    });
  });

  describe('POST /api/auth/login', () => {
    it.skipIf(!useDb)('should return 200 with user, accessToken and refreshToken', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: testEmail,
          password: testPassword,
        })
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe('Login successful');
      expect(res.body.responseObject).toHaveProperty('user');
      expect(res.body.responseObject).toHaveProperty('accessToken');
      expect(res.body.responseObject).toHaveProperty('refreshToken');
      expect(res.body.responseObject).toHaveProperty('expiresIn');
      expect(res.body.responseObject.user.email).toBe(testEmail);
      expect(typeof res.body.responseObject.accessToken).toBe('string');
      expect(res.body.responseObject.accessToken.length).toBeGreaterThan(0);
    });

    it.skipIf(!useDb)('should return 401 when password is wrong', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: testEmail,
          password: 'wrong-password',
        })
        .expect(401);

      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/invalid|password/i);
    });

    it.skipIf(!useDb)('should return 401 when email does not exist', async () => {
      await request(app)
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: testPassword,
        })
        .expect(401);
    });
  });

  describe('GET /api/auth/me (auth.middleware)', () => {
    let validAccessToken: string;

    it.skipIf(!useDb)('should return 200 and user when valid JWT is sent', async () => {
      const loginRes = await request(app)
        .post('/api/auth/login')
        .send({ email: testEmail, password: testPassword })
        .expect(200);

      validAccessToken = loginRes.body.responseObject.accessToken;
      expect(validAccessToken).toBeDefined();

      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${validAccessToken}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.responseObject).toMatchObject({
        sub: expect.any(String),
        email: testEmail,
        type: 'access',
      });
    });

    it('should return 401 when no Authorization header', async () => {
      const res = await request(app).get('/api/auth/me').expect(401);

      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/authentication required/i);
    });

    it('should return 401 when token is invalid (malformed)', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);

      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/invalid|expired|token/i);
    });

    it('should return 401 when Authorization is not Bearer', async () => {
      await request(app).get('/api/auth/me').set('Authorization', 'Basic something').expect(401);
    });
  });
});
