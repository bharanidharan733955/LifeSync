import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { env } from '../config/env.js';
import User from '../models/User.js';
import RefreshToken from '../models/RefreshToken.js';
import { AppError } from '../utils/AppError.js';

// ─── Token Expiration Times ──────────────────────────────────────────────────
const ACCESS_TOKEN_EXPIRY = env.JWT_ACCESS_EXPIRES_IN || '15m';
const REFRESH_TOKEN_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

/**
 * Generate Access Token (JWT, 15m) and Refresh Token (Cryptographic Hex, 7d).
 * Stores only the SHA-256 hash of the refresh token in MongoDB.
 */
export const generateTokens = async (user, deviceInfo = {}) => {
  // 1. Sign 15-minute access token
  const accessToken = jwt.sign(
    { sub: user._id.toString(), email: user.email },
    env.JWT_ACCESS_SECRET,
    { expiresIn: ACCESS_TOKEN_EXPIRY }
  );

  // 2. Generate random 64-byte hex string for refresh token
  const rawRefreshToken = crypto.randomBytes(32).toString('hex');
  const tokenHash = RefreshToken.hashToken(rawRefreshToken);
  const expiresAt = new Date(Date.now() + REFRESH_TOKEN_TTL_MS);

  // 3. Save hashed session record in MongoDB
  await RefreshToken.create({
    user: user._id,
    tokenHash,
    deviceInfo: {
      userAgent: deviceInfo.userAgent || null,
      ip: deviceInfo.ip || null,
      platform: deviceInfo.platform || 'web',
    },
    expiresAt,
  });

  return { accessToken, refreshToken: rawRefreshToken };
};

/**
 * Register a new user.
 */
export const register = async ({ fullName, email, password, deviceInfo = {} }) => {
  const normalizedEmail = email.toLowerCase().trim();

  // Check duplicate email
  const existingUser = await User.findOne({ email: normalizedEmail });
  if (existingUser) {
    throw AppError.conflict('An account with this email address already exists');
  }

  // Create user (password hashed automatically in pre-save hook)
  const user = await User.create({
    fullName: fullName.trim(),
    email: normalizedEmail,
    password,
    status: 'ACTIVE',
  });

  // Generate tokens
  const tokens = await generateTokens(user, deviceInfo);

  return {
    user: user.toJSON(),
    ...tokens,
  };
};

/**
 * Login user with email & password.
 */
export const login = async ({ email, password, deviceInfo = {} }) => {
  const normalizedEmail = email.toLowerCase().trim();

  // Find user and explicitly select password field
  const user = await User.findOne({ email: normalizedEmail }).select('+password');
  if (!user) {
    throw AppError.unauthorized('Invalid email or password');
  }

  // Check password
  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    throw AppError.unauthorized('Invalid email or password');
  }

  // Check account suspension status
  if (user.status === 'SUSPENDED') {
    throw AppError.forbidden('Your account is suspended. Contact support.');
  }

  // Update lastLoginAt
  user.lastLoginAt = new Date();
  await user.save();

  // Generate tokens
  const tokens = await generateTokens(user, deviceInfo);

  return {
    user: user.toJSON(),
    ...tokens,
  };
};

/**
 * Refresh Access Token with Token Rotation and Reuse Detection.
 */
export const refreshSession = async ({ rawRefreshToken, deviceInfo = {} }) => {
  if (!rawRefreshToken) {
    throw AppError.unauthorized('Refresh token is required');
  }

  const tokenHash = RefreshToken.hashToken(rawRefreshToken);
  const existingSession = await RefreshToken.findOne({ tokenHash });

  // ── REUSE DETECTION ─────────────────────────────────────────────────────────
  // If token is found but already marked revoked, someone is reusing an old/stolen token!
  if (existingSession && existingSession.isRevoked) {
    // Immediate breach mitigation: Invalidate ALL active sessions for this user
    await RefreshToken.updateMany(
      { user: existingSession.user, isRevoked: false },
      { isRevoked: true, revokedAt: new Date() }
    );
    throw AppError.forbidden(
      'Refresh token reuse detected. All active sessions have been terminated. Please log in again.'
    );
  }

  // Check if session does not exist or has expired
  if (!existingSession || existingSession.isExpired()) {
    throw AppError.unauthorized('Invalid or expired refresh token. Please log in again.');
  }

  // Fetch user associated with this session
  const user = await User.findById(existingSession.user);
  if (!user) {
    throw AppError.unauthorized('User associated with this token no longer exists.');
  }

  if (user.status === 'SUSPENDED') {
    throw AppError.forbidden('Your account is suspended. Contact support.');
  }

  // ── TOKEN ROTATION ──────────────────────────────────────────────────────────
  // 1. Revoke the current token
  existingSession.isRevoked = true;
  existingSession.revokedAt = new Date();

  // 2. Issue new token pair
  const newRawRefreshToken = crypto.randomBytes(32).toString('hex');
  const newTokenHash = RefreshToken.hashToken(newRawRefreshToken);
  const newExpiresAt = new Date(Date.now() + REFRESH_TOKEN_TTL_MS);

  // 3. Create replacement session
  await RefreshToken.create({
    user: user._id,
    tokenHash: newTokenHash,
    deviceInfo: {
      userAgent: deviceInfo.userAgent || existingSession.deviceInfo?.userAgent || null,
      ip: deviceInfo.ip || existingSession.deviceInfo?.ip || null,
      platform: deviceInfo.platform || existingSession.deviceInfo?.platform || 'web',
    },
    expiresAt: newExpiresAt,
  });

  // 4. Link previous session to the replacement token
  existingSession.replacedByToken = newTokenHash;
  await existingSession.save();

  // 5. Sign new access token
  const newAccessToken = jwt.sign(
    { sub: user._id.toString(), email: user.email },
    env.JWT_ACCESS_SECRET,
    { expiresIn: ACCESS_TOKEN_EXPIRY }
  );

  return {
    user: user.toJSON(),
    accessToken: newAccessToken,
    refreshToken: newRawRefreshToken,
  };
};

/**
 * Logout current session (revokes specific refresh token).
 */
export const logout = async (rawRefreshToken) => {
  if (!rawRefreshToken) return;
  const tokenHash = RefreshToken.hashToken(rawRefreshToken);
  await RefreshToken.findOneAndUpdate(
    { tokenHash, isRevoked: false },
    { isRevoked: true, revokedAt: new Date() }
  );
};

/**
 * Logout all sessions for user (revokes every active refresh token).
 */
export const logoutAll = async (userId) => {
  await RefreshToken.updateMany(
    { user: userId, isRevoked: false },
    { isRevoked: true, revokedAt: new Date() }
  );
};

/**
 * Get profile of authenticated user.
 */
export const getUserProfile = async (userId) => {
  const user = await User.findById(userId);
  if (!user) {
    throw AppError.notFound('User not found');
  }
  return user.toJSON();
};

/**
 * Update user profile.
 */
export const updateUserProfile = async (userId, { fullName, profileImage }) => {
  const user = await User.findById(userId);
  if (!user) {
    throw AppError.notFound('User not found');
  }

  if (fullName !== undefined) {
    user.fullName = fullName.trim();
  }
  if (profileImage !== undefined) {
    user.profileImage = profileImage;
  }

  await user.save();
  return user.toJSON();
};

export default {
  generateTokens,
  register,
  login,
  refreshSession,
  logout,
  logoutAll,
  getUserProfile,
  updateUserProfile,
};

