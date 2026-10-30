import rateLimit from 'express-rate-limit';
import { env } from '../config/env.js';

// ─── Rate limiting configurations ────────────────────────────────────────────

/**
 * General API rate limiter – applied to all /api routes.
 */
export const apiLimiter = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  max: env.RATE_LIMIT_MAX,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests from this IP. Please try again later.',
    code: 'TOO_MANY_REQUESTS',
  },
  skip: () => env.NODE_ENV === 'test',
});

/**
 * Strict rate limiter for authentication routes.
 * Prevents brute force attacks.
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: env.AUTH_RATE_LIMIT_MAX,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many authentication attempts. Please wait 15 minutes.',
    code: 'TOO_MANY_AUTH_ATTEMPTS',
  },
  skip: () => env.NODE_ENV === 'test',
});

/**
 * Strict rate limiter for AI endpoints (cost control).
 */
export const aiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'AI request limit reached. Please wait before making more AI requests.',
    code: 'AI_RATE_LIMIT',
  },
  skip: () => env.NODE_ENV === 'test',
});

/**
 * Rate limiter for password reset / forgot password.
 */
export const passwordResetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many password reset requests. Please try again after 1 hour.',
    code: 'TOO_MANY_RESET_REQUESTS',
  },
  skip: () => env.NODE_ENV === 'test',
});

