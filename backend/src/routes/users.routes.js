import { Router } from 'express';
import { authenticate } from '../middleware/authMiddleware.js';
import { validate } from '../middleware/validate.js';
import { updateUserMeSchema } from '../validators/schemas.js';
import * as userController from '../controllers/userController.js';

const router = Router();

// All user routes require authentication
router.use(authenticate);

/**
 * @swagger
 * /users/me:
 *   get:
 *     tags: [Users]
 *     summary: Get profile of authenticated user
 *     responses:
 *       200:
 *         description: Current user profile
 *       401:
 *         description: Unauthorized
 */
router.get('/me', userController.getCurrentUser);

/**
 * @swagger
 * /users/me:
 *   put:
 *     tags: [Users]
 *     summary: Update profile of authenticated user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               fullName: { type: string, example: Priya Sharma }
 *               profileImage: { type: string, nullable: true, example: "https://example.com/avatar.jpg" }
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *       401:
 *         description: Unauthorized
 *       422:
 *         description: Validation error
 */
router.put('/me', validate(updateUserMeSchema), userController.updateCurrentUser);

export default router;

