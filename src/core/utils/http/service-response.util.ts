import { HTTP_STATUS } from '@utils/http/http-status.util.js';

// Standardized response format for all API endpoints
// Ensures consistent structure across the entire application
class ServiceResponse<T = null> {
  readonly success: boolean;
  readonly message: string;
  readonly responseObject: T;
  readonly statusCode: number;

  // Private constructor to enforce using factory methods
  // This maintains consistency in response creation
  private constructor(success: boolean, message: string, responseObject: T, statusCode: number) {
    this.success = success;
    this.message = message;
    this.responseObject = responseObject;
    this.statusCode = statusCode;
  }

  // Factory method for successful responses
  // Defaults to 200 OK status code if not specified
  static success<T>(message: string, responseObject: T, statusCode: number = HTTP_STATUS.OK) {
    return new ServiceResponse(true, message, responseObject, statusCode);
  }

  // Factory method for error responses
  // Defaults to 404 Not Found status code if not specified
  static failure<T>(
    message: string,
    responseObject: T,
    statusCode: number = HTTP_STATUS.NOT_FOUND,
  ) {
    return new ServiceResponse(false, message, responseObject, statusCode);
  }
}

export { ServiceResponse };
