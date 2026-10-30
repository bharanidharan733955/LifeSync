import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { AppError } from '../utils/AppError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import User from '../models/User.js';

// ─── Authentication middleware ───────────────────────────────────────────────
// Verifies JWT access token from the Authorization header.
// Sets req.user to the authenticated user document (without password).
// NEVER trusts user IDs from request body/params – only from verified token.

export const authenticate = asyncHandler(async (req, res, next) => {
  // 1. Extract token from Authorization header
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw AppError.unauthorized('No authentication token provided');
  }

  const token = authHeader.split(' ')[1];
  if (!token) {
    throw AppError.unauthorized('Invalid authorization header format');
  }

  // 2. Verify token
  let decoded;
  try {
    decoded = jwt.verify(token, env.JWT_ACCESS_SECRET);
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      throw AppError.unauthorized('Access token expired. Please refresh.');
    }
    throw AppError.unauthorized('Invalid access token');
  }

  // 3. Fetch user from DB (ensures user still exists and is active)
  const user = await User.findById(decoded.sub).select('-password -__v');
  if (!user) {
    throw AppError.unauthorized('User account not found');
  }

  if (!user.isActive) {
    throw AppError.forbidden('Your account has been deactivated. Contact support.');
  }

  // 4. Attach verified user to request
  req.user = user;
  req.userId = user._id.toString(); // convenience shorthand

  next();
});

// ─── Authorization middleware ────────────────────────────────────────────────
// Role-based access control. Call after authenticate().

/**
 * Restrict access to specific roles.
 * @param  {...string} roles - e.g. 'admin', 'user'
 */
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(AppError.unauthorized('Not authenticated'));
    }
    if (!roles.includes(req.user.role)) {
      return next(
        AppError.forbidden(`Access denied. Required role(s): ${roles.join(', ')}`)
      );
    }
    next();
  };
};

// ─── Optional auth ───────────────────────────────────────────────────────────
// Like authenticate but doesn't throw if no token – just skips attaching user.
export const optionalAuth = asyncHandler(async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next();
  }

  const token = authHeader.split(' ')[1];
  if (!token) return next();

  try {
    const decoded = jwt.verify(token, env.JWT_ACCESS_SECRET);
    const user = await User.findById(decoded.sub).select('-password -__v');
    if (user && user.isActive) {
      req.user = user;
      req.userId = user._id.toString();
    }
  } catch {
    // Ignore token errors for optional auth
  }

  next();
});

export default authenticate;

