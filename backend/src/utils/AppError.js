import { v4 as uuidv4 } from 'uuid';

// ─── AppError class ──────────────────────────────────────────────────────────
// All operational errors in the application should be instances of AppError.
// These are handled specifically in the global error middleware.
// Unexpected (programmer) errors are treated differently.

export class AppError extends Error {
  /**
   * @param {string} message    - Human-readable error message
   * @param {number} statusCode - HTTP status code
   * @param {string} [code]     - Machine-readable error code
   * @param {Array}  [errors]   - Validation or field-level errors
   */
  constructor(message, statusCode = 500, code = 'INTERNAL_ERROR', errors = null) {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.code = code;
    this.errors = errors;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }

  // ── Factory methods for common error types ────────────────────────────────
  static badRequest(message = 'Bad request', errors = null) {
    return new AppError(message, 400, 'BAD_REQUEST', errors);
  }

  static unauthorized(message = 'Unauthorized') {
    return new AppError(message, 401, 'UNAUTHORIZED');
  }

  static forbidden(message = 'Forbidden') {
    return new AppError(message, 403, 'FORBIDDEN');
  }

  static notFound(message = 'Resource not found') {
    return new AppError(message, 404, 'NOT_FOUND');
  }

  static conflict(message = 'Conflict') {
    return new AppError(message, 409, 'CONFLICT');
  }

  static unprocessable(message = 'Unprocessable entity', errors = null) {
    return new AppError(message, 422, 'UNPROCESSABLE_ENTITY', errors);
  }

  static tooManyRequests(message = 'Too many requests') {
    return new AppError(message, 429, 'TOO_MANY_REQUESTS');
  }

  static internal(message = 'Internal server error') {
    return new AppError(message, 500, 'INTERNAL_ERROR');
  }
}

export default AppError;

