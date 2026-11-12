import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { AppError } from '../utils/AppError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import User from '../models/User.js';

// ─── Authentication middleware ───────────────────────────────────────────────
// Verifies JWT access token from the Authorization header.
// Sets req.user and req.userId to the authenticated user.
// Enforces that suspended accounts cannot access any authenticated routes.
// NEVER trusts user IDs from request body/params – always from verified token.

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

  // 2. Verify token signature and expiration
  let decoded;
  try {
    decoded = jwt.verify(token, env.JWT_ACCESS_SECRET);
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      throw AppError.unauthorized('Access token expired. Please refresh.');
    }
    throw AppError.unauthorized('Invalid access token');
  }

  // 3. Fetch user from DB (ensures user still exists)
  const user = await User.findById(decoded.sub).select('-password');
  if (!user) {
    throw AppError.unauthorized('User account not found');
  }

  // 4. Enforce account status: SUSPENDED accounts are immediately blocked
  if (user.status === 'SUSPENDED') {
    throw AppError.forbidden('Your account is suspended. Contact support.');
  }

  // 5. Attach verified user to request
  req.user = user;
  req.userId = user._id.toString();

  next();
});

// ─── Ownership enforcement helper ────────────────────────────────────────────
// Asserts that a resource is owned by the currently authenticated user.
export const enforceOwnership = (resourceUserId, authenticatedUserId) => {
  const resourceOwnerStr = resourceUserId?.toString();
  const authUserStr = authenticatedUserId?.toString();
  if (!resourceOwnerStr || resourceOwnerStr !== authUserStr) {
    throw AppError.forbidden('Access denied. You do not own this resource.');
  }
};

export default authenticate;
