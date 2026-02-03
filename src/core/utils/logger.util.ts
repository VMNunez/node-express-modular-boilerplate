/**
 * Centralized logger. Replace with pino/winston for production if you need
 * structured logs, correlation IDs, or log levels.
 */
export const logger = {
  error(message: string, meta?: Record<string, unknown>): void {
    if (meta) {
      console.error(`[ERROR] ${message}`, meta);
    } else {
      console.error(`[ERROR] ${message}`);
    }
  },

  warn(message: string, meta?: Record<string, unknown>): void {
    if (meta) {
      console.warn(`[WARN] ${message}`, meta);
    } else {
      console.warn(`[WARN] ${message}`);
    }
  },

  info(message: string, meta?: Record<string, unknown>): void {
    if (meta) {
      console.info(`[INFO] ${message}`, meta);
    } else {
      console.info(`[INFO] ${message}`);
    }
  },

  debug(message: string, meta?: Record<string, unknown>): void {
    if (meta) {
      console.debug(`[DEBUG] ${message}`, meta);
    } else {
      console.debug(`[DEBUG] ${message}`);
    }
  },
};
