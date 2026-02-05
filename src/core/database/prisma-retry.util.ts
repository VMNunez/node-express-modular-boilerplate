import { logger } from '@core/utils/logger.util.js';

/**
 * List of Prisma Error Codes that represent transient issues.
 * These are network timeouts, connection spikes, or temporary locks
 * that might succeed if retried after a short delay.
 */
const RETRYABLE_ERROR_CODES = [
  'P1000', // Authentication failed (due to server load)
  'P1001', // Database server unreachable
  'P1002', // Connection timeout
  'P1008', // Operation timeout
  'P1011', // TLS connection error
  'P1017', // Server closed connection
  'P2002', // Unique constraint (can be transient in race conditions)
];

/**
 * Determines if a caught error should trigger a retry attempt.
 */
function isRetryableError(error: unknown): boolean {
  if (error && typeof error === 'object' && 'code' in error) {
    const code = (error as { code: string }).code;
    return RETRYABLE_ERROR_CODES.includes(code);
  }
  return false;
}

/**
 * Implements Exponential Backoff algorithm.
 * Increases wait time between attempts to avoid overwhelming the database.
 * Delay formula: baseDelay * 2^attempt
 */
function calculateBackoffDelay(
  attempt: number,
  baseDelayMs: number = 100,
  maxDelayMs: number = 5000,
): number {
  const exponentialDelay = baseDelayMs * Math.pow(2, attempt);
  return Math.min(exponentialDelay, maxDelayMs);
}

/**
 * Simple utility to pause execution.
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export interface RetryConfig {
  maxRetries?: number;
  baseDelayMs?: number;
  maxDelayMs?: number;
  onRetry?: (attempt: number, error: unknown) => void;
}

const DEFAULT_RETRY_CONFIG: Required<RetryConfig> = {
  maxRetries: 3,
  baseDelayMs: 100,
  maxDelayMs: 5000,
  onRetry: () => {},
};

/**
 * Higher-Order Function to execute Prisma operations with auto-retry.
 * Improves resilience against network blips and temporary DB spikes.
 */
export async function withRetry<T>(
  operation: () => Promise<T>,
  config: RetryConfig = {},
): Promise<T> {
  const retryConfig = { ...DEFAULT_RETRY_CONFIG, ...config };
  let lastError: unknown;

  for (let attempt = 0; attempt <= retryConfig.maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;

      if (attempt === retryConfig.maxRetries || !isRetryableError(error)) {
        if (!isRetryableError(error)) {
          logger.warn({ error, attempt }, 'Non-retryable error: Aborting retries');
        }
        throw error;
      }

      const delay = calculateBackoffDelay(attempt, retryConfig.baseDelayMs, retryConfig.maxDelayMs);

      logger.warn(
        {
          error: error instanceof Error ? error.message : String(error),
          attempt: attempt + 1,
          delay,
        },
        'Retrying Prisma operation...',
      );

      retryConfig.onRetry(attempt + 1, error);
      await sleep(delay);
    }
  }

  throw lastError;
}

/**
 * CIRCUIT BREAKER PATTERN
 * Prevents cascading failures. If the database is consistently failing,
 * we "open" the circuit to reject requests immediately, allowing the DB to recover.
 */
enum CircuitState {
  CLOSED = 'closed', // Normal: Requests pass through
  OPEN = 'open', // Failing: Requests rejected immediately
  HALF_OPEN = 'half-open', // Testing: Allowing a few requests to check recovery
}

export interface CircuitBreakerConfig {
  failureThreshold?: number;
  resetTimeoutMs?: number;
  monitoringWindowMs?: number;
}

const DEFAULT_CIRCUIT_BREAKER_CONFIG: Required<CircuitBreakerConfig> = {
  failureThreshold: 5,
  resetTimeoutMs: 60000,
  monitoringWindowMs: 60000,
};

export class CircuitBreaker {
  private state: CircuitState = CircuitState.CLOSED;
  private failures: number = 0;
  private lastFailureTime: number = 0;
  private readonly config: Required<CircuitBreakerConfig>;

  constructor(config: CircuitBreakerConfig = {}) {
    this.config = { ...DEFAULT_CIRCUIT_BREAKER_CONFIG, ...config };
  }

  /**
   * Executes an operation protected by the Circuit Breaker.
   */
  async execute<T>(operation: () => Promise<T>): Promise<T> {
    if (this.state === CircuitState.OPEN) {
      const timeSinceLastFailure = Date.now() - this.lastFailureTime;

      // Attempt recovery after the reset timeout
      if (timeSinceLastFailure >= this.config.resetTimeoutMs) {
        this.state = CircuitState.HALF_OPEN;
        logger.info('Circuit breaker entering HALF_OPEN state');
      } else {
        throw new Error('Circuit breaker is OPEN - Service currently unavailable');
      }
    }

    try {
      const result = await operation();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  private onSuccess(): void {
    this.failures = 0;
    if (this.state === CircuitState.HALF_OPEN) {
      this.state = CircuitState.CLOSED;
      logger.info('Circuit breaker CLOSED - Service recovered successfully');
    }
  }

  private onFailure(): void {
    this.failures++;
    this.lastFailureTime = Date.now();

    if (this.failures >= this.config.failureThreshold) {
      this.state = CircuitState.OPEN;
      logger.error('Circuit breaker OPENED - Failure threshold reached');
    }
  }
}

export const dbCircuitBreaker = new CircuitBreaker();
