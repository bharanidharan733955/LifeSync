import { env } from '../config/env.js';
import { sendSuccess } from '../utils/apiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import * as authService from '../services/authService.js';

// ─── Helper: HTTP-Only Refresh Token Cookie Options ──────────────────────────
const getRefreshCookieOptions = () => {
  const isProd = env.NODE_ENV === 'production';
  const sameSite = env.COOKIE_SAME_SITE || (isProd ? 'none' : 'lax');
  return {
    httpOnly: true,
    secure: sameSite === 'none' ? true : isProd,
    sameSite,
    path: '/',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  };
};

// Helper: Extract device information from request
const getDeviceInfo = (req) => {
  const userAgent = req.headers['user-agent'] || '';
  let platform = 'web';
  if (/android/i.test(userAgent)) platform = 'android';
  else if (/iphone|ipad|ipod/i.test(userAgent)) platform = 'ios';
  else if (req.headers['x-client-platform']) {
    platform = req.headers['x-client-platform'];
  }

  return {
    userAgent,
    ip: req.ip || req.connection?.remoteAddress,
    platform,
  };
};

/**
 * POST /api/v1/auth/register
 */
export const register = asyncHandler(async (req, res) => {
  const { fullName, email, password } = req.body;
  const deviceInfo = getDeviceInfo(req);

  const result = await authService.register({ fullName, email, password, deviceInfo });

  // Set HTTP-only cookie for web browsers
  res.cookie('refreshToken', result.refreshToken, getRefreshCookieOptions());

  sendSuccess(res, {
    status: 201,
    message: 'User registered successfully',
    data: {
      user: result.user,
      accessToken: result.accessToken,
      refreshToken: result.refreshToken, // also provided for mobile SecureStore
    },
  });
});

/**
 * POST /api/v1/auth/login
 */
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const deviceInfo = getDeviceInfo(req);

  const result = await authService.login({ email, password, deviceInfo });

  // Set HTTP-only cookie for web browsers
  res.cookie('refreshToken', result.refreshToken, getRefreshCookieOptions());

  sendSuccess(res, {
    message: 'Login successful',
    data: {
      user: result.user,
      accessToken: result.accessToken,
      refreshToken: result.refreshToken, // also provided for mobile SecureStore
    },
  });
});

/**
 * POST /api/v1/auth/refresh
 */
export const refresh = asyncHandler(async (req, res) => {
  // Extract refresh token from either HTTP-only cookie or request body (mobile)
  const rawRefreshToken = req.cookies?.refreshToken || req.body?.refreshToken;
  const deviceInfo = getDeviceInfo(req);

  const result = await authService.refreshSession({ rawRefreshToken, deviceInfo });

  // Rotate HTTP-only cookie
  res.cookie('refreshToken', result.refreshToken, getRefreshCookieOptions());

  sendSuccess(res, {
    message: 'Session refreshed successfully',
    data: {
      user: result.user,
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
    },
  });
});

/**
 * POST /api/v1/auth/logout
 */
export const logout = asyncHandler(async (req, res) => {
  const rawRefreshToken = req.cookies?.refreshToken || req.body?.refreshToken;

  if (rawRefreshToken) {
    await authService.logout(rawRefreshToken);
  }

  // Clear cookie
  res.clearCookie('refreshToken', getRefreshCookieOptions());

  sendSuccess(res, {
    message: 'Logged out successfully',
  });
});

/**
 * POST /api/v1/auth/logout-all
 */
export const logoutAll = asyncHandler(async (req, res) => {
  await authService.logoutAll(req.userId);

  // Clear cookie
  res.clearCookie('refreshToken', getRefreshCookieOptions());

  sendSuccess(res, {
    message: 'All active sessions have been logged out successfully',
  });
});

/**
 * GET /api/v1/auth/me
 */
export const getMe = asyncHandler(async (req, res) => {
  const user = await authService.getUserProfile(req.userId);

  sendSuccess(res, {
    message: 'User profile retrieved successfully',
    data: { user },
  });
});

export default {
  register,
  login,
  refresh,
  logout,
  logoutAll,
  getMe,
};

