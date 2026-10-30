import mongoose from 'mongoose';
import { env } from '../config/env.js';
import { AppError } from '../utils/AppError.js';

// ─── Global error handling middleware ────────────────────────────────────────
// This must be the LAST middleware registered in app.js (4 arguments).
// It handles all errors forwarded via next(error).

const handleCastError = (err) => {
  const message = `Invalid value for field '${err.path}': ${err.value}`;
  return new AppError(message, 400, 'INVALID_ID');
};

const handleDuplicateFieldsError = (err) => {
  const field = Object.keys(err.keyValue || {})[0] || 'field';
  const value = err.keyValue?.[field];
  const message = `Duplicate value for ${field}: '${value}'. Please use a different value.`;
  return new AppError(message, 409, 'DUPLICATE_FIELD');
};

const handleValidationError = (err) => {
  const errors = Object.values(err.errors).map((e) => ({
    field: e.path,
    message: e.message,
  }));
  return new AppError('Validation failed', 422, 'VALIDATION_ERROR', errors);
};

const handleJWTError = () =>
  new AppError('Invalid token. Please log in again.', 401, 'INVALID_TOKEN');

const handleJWTExpiredError = () =>
  new AppError('Your token has expired. Please log in again.', 401, 'TOKEN_EXPIRED');

const handleZodError = (err) => {
  const errors = err.errors?.map((e) => ({
    field: e.path.join('.'),
    message: e.message,
  }));
  return new AppError('Validation failed', 422, 'VALIDATION_ERROR', errors);
};

// ─── Production error response (no leak of internals) ───────────────────────
const sendProductionError = (err, res) => {
  if (err.isOperational) {
    const body = { success: false, message: err.message, code: err.code };
    if (err.errors) body.errors = err.errors;
    return res.status(err.statusCode).json(body);
  }
  // Unknown / programmer error: log it, send generic response
  console.error('[ERROR]', err);
  return res.status(500).json({
    success: false,
    message: 'Something went wrong. Please try again later.',
    code: 'INTERNAL_ERROR',
  });
};

// ─── Development error response (full details) ───────────────────────────────
const sendDevelopmentError = (err, res) => {
  return res.status(err.statusCode || 500).json({
    success: false,
    message: err.message,
    code: err.code || 'INTERNAL_ERROR',
    errors: err.errors || null,
    stack: err.stack,
  });
};

// ─── Main error middleware ───────────────────────────────────────────────────
// eslint-disable-next-line no-unused-vars
export const errorMiddleware = (err, req, res, next) => {
  let error = err;

  // Mongoose CastError (e.g. invalid ObjectId)
  if (err instanceof mongoose.Error.CastError) {
    error = handleCastError(err);
  }
  // MongoDB duplicate key
  else if (err.code === 11000) {
    error = handleDuplicateFieldsError(err);
  }
  // Mongoose ValidationError
  else if (err instanceof mongoose.Error.ValidationError) {
    error = handleValidationError(err);
  }
  // JWT errors
  else if (err.name === 'JsonWebTokenError') {
    error = handleJWTError();
  } else if (err.name === 'TokenExpiredError') {
    error = handleJWTExpiredError();
  }
  // Zod validation errors
  else if (err.name === 'ZodError') {
    error = handleZodError(err);
  }

  // Ensure statusCode is set
  if (!error.statusCode) error.statusCode = 500;
  if (!error.isOperational) error.isOperational = false;

  if (env.NODE_ENV === 'development') {
    return sendDevelopmentError(error, res);
  }
  return sendProductionError(error, res);
};

export default errorMiddleware;

