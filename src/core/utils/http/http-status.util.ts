/**
 * HTTP Status Codes
 * Constants for the most commonly used HTTP status codes
 */
const HTTP_STATUS = {
  // Success (200-299)
  OK: 200, // Standard successful response
  CREATED: 201, // Resource successfully created
  ACCEPTED: 202, // Request accepted for processing
  NO_CONTENT: 204, // Success but no content to return

  // Redirection (300-399)
  MOVED_PERMANENTLY: 301, // Resource permanently moved
  FOUND: 302, // Resource temporarily located elsewhere
  NOT_MODIFIED: 304, // Resource not modified (caching)

  // Client errors (400-499)
  BAD_REQUEST: 400, // Malformed or invalid request
  UNAUTHORIZED: 401, // Not authenticated or invalid credentials
  FORBIDDEN: 403, // Authenticated but insufficient permissions
  NOT_FOUND: 404, // Resource not found
  METHOD_NOT_ALLOWED: 405, // HTTP method not allowed for resource
  CONFLICT: 409, // Conflict with current resource state
  UNPROCESSABLE_ENTITY: 422, // Request well-formed but semantically invalid
  TOO_MANY_REQUESTS: 429, // User has sent too many requests in a given amount of time ("rate limiting")

  // Server errors (500-599)
  INTERNAL_SERVER_ERROR: 500, // Generic server error
  NOT_IMPLEMENTED: 501, // Functionality not implemented
  BAD_GATEWAY: 502, // Invalid response from upstream server
  SERVICE_UNAVAILABLE: 503, // Server temporarily unavailable
};

export { HTTP_STATUS };
