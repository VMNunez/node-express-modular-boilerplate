import { describe, it, expect } from 'vitest';
import express from 'express';
import request from 'supertest';
import { createLimiter } from '@middlewares/rate-limiter.middleware.js';
import { HTTP_STATUS } from '@utils/http/http-status.util.js';

describe('Rate limiter', () => {
  // This test checks if the rate limiter allows the specified number of requests
  // before starting to block them.
  it('should allow requests up to the limit', async () => {
    const limit = 5; // Defines the maximum number of allowed requests
    const testApp = express(); // Creates a new Express app instance
    testApp.use(createLimiter(limit)); // Applies the rate limiter middleware to the test app

    // Defines a simple GET route for the test endpoint
    testApp.get('/health', (_req, res) => {
      res.json({ status: 'ok' });
    });

    // Loops to make requests up to the defined limit.
    // All of these requests are expected to be successful (HTTP 200)
    for (let i = 0; i < limit; i++) {
      const res = await request(testApp).get('/health');
      expect(res.status).toBe(HTTP_STATUS.OK);
    }

    // The next request should exceed the limit
    // We expect the rate limiter to block it with an HTTP 429 status code.
    const res = await request(testApp).get('/health');
    expect(res.status).toBe(HTTP_STATUS.TOO_MANY_REQUESTS);
  });
});
