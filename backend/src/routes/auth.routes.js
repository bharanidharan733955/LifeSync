import { Router } from 'express';
import { authLimiter } from '../middleware/rateLimiter.js';
import { validate } from '../middleware/validate.js';
import { authenticate } from '../middleware/authMiddleware.js';
import { registerSchema, loginSchema } from '../validators/schemas.js';
import * as authController from '../controllers/authController.js';

const router = Router();

/**
 * @swagger
 * /auth/register:
 *   post:
 *     tags: [Auth]
 *     summary: Register a new user
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [fullName, email, password]
 *             properties:
 *               fullName: { type: string, example: Priya Sharma }
 *               email: { type: string, example: priya@example.com }
 *               password: { type: string, example: SecurePass123 }
 *               confirmPassword: { type: string, example: SecurePass123 }
 *     responses:
 *       201:
 *         description: User registered successfully. Returns user & tokens.
 *       409:
 *         description: Email already in use
 *       422:
 *         description: Validation error
 */
router.post('/register', authLimiter, validate(registerSchema), authController.register);

/**
 * @swagger
 * /auth/login:
 *   post:
 *     tags: [Auth]
 *     summary: Login with email and password
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email: { type: string, example: priya@example.com }
 *               password: { type: string, example: SecurePass123 }
 *     responses:
 *       200:
 *         description: Login successful. Sets HTTP-only refresh cookie and returns access token.
 *       401:
 *         description: Invalid credentials
 *       403:
 *         description: Account suspended
 */
router.post('/login', authLimiter, validate(loginSchema), authController.login);

/**
 * @swagger
 * /auth/refresh:
 *   post:
 *     tags: [Auth]
 *     summary: Rotate and refresh access token session
 *     security: []
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               refreshToken: { type: string, description: "Optional if passed via HTTP-only cookie" }
 *     responses:
 *       200:
 *         description: New access and rotated refresh token issued
 *       401:
 *         description: Invalid or expired refresh token
 *       403:
 *         description: Reuse detected or account suspended
 */
router.post('/refresh', authController.refresh);

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     tags: [Auth]
 *     summary: Logout current session and revoke refresh token
 *     responses:
 *       200:
 *         description: Logged out successfully
 */
router.post('/logout', authController.logout);

/**
 * @swagger
 * /auth/logout-all:
 *   post:
 *     tags: [Auth]
 *     summary: Invalidate all active sessions for authenticated user
 *     responses:
 *       200:
 *         description: All active sessions logged out
 *       401:
 *         description: Unauthorized
 */
router.post('/logout-all', authenticate, authController.logoutAll);

/**
 * @swagger
 * /auth/me:
 *   get:
 *     tags: [Auth]
 *     summary: Get profile of authenticated user
 *     responses:
 *       200:
 *         description: Authenticated user profile
 *       401:
 *         description: Unauthorized
 */
router.get('/me', authenticate, authController.getMe);

export default router;
