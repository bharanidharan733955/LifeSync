import { Router } from 'express';
import { authenticate } from '../middleware/authMiddleware.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { validate } from '../middleware/validate.js';
import {
  createSavingsGoalSchema,
  updateSavingsGoalSchema,
  savingsGoalStatusSchema,
  addContributionSchema,
  savingsGoalQuerySchema,
} from '../validators/schemas.js';
import * as savingsGoalController from '../controllers/savingsGoalController.js';

const router = Router();

// All savings goal routes require authentication
router.use(authenticate);

/**
 * @swagger
 * /savings-goals/summary:
 *   get:
 *     tags: [Finance - Savings Goals]
 *     summary: Get overall savings goals summary and aggregate metrics
 */
router.get('/summary', asyncHandler(savingsGoalController.getSavingsSummary));

/**
 * @swagger
 * /savings-goals:
 *   get:
 *     tags: [Finance - Savings Goals]
 *     summary: List user savings goals with dynamic progress and filtering
 */
router.get(
  '/',
  validate(savingsGoalQuerySchema, 'query'),
  asyncHandler(savingsGoalController.getSavingsGoals)
);

/**
 * @swagger
 * /savings-goals:
 *   post:
 *     tags: [Finance - Savings Goals]
 *     summary: Create a new savings goal
 */
router.post(
  '/',
  validate(createSavingsGoalSchema),
  asyncHandler(savingsGoalController.createSavingsGoal)
);

/**
 * @swagger
 * /savings-goals/{id}:
 *   get:
 *     tags: [Finance - Savings Goals]
 *     summary: Get a single savings goal with detailed progress
 */
router.get('/:id', asyncHandler(savingsGoalController.getSavingsGoalById));

/**
 * @swagger
 * /savings-goals/{id}:
 *   put:
 *     tags: [Finance - Savings Goals]
 *     summary: Update savings goal details
 */
router.put(
  '/:id',
  validate(updateSavingsGoalSchema),
  asyncHandler(savingsGoalController.updateSavingsGoal)
);

/**
 * @swagger
 * /savings-goals/{id}/status:
 *   patch:
 *     tags: [Finance - Savings Goals]
 *     summary: Update savings goal status (ACTIVE, PAUSED, CANCELLED, COMPLETED)
 */
router.patch(
  '/:id/status',
  validate(savingsGoalStatusSchema),
  asyncHandler(savingsGoalController.updateSavingsGoalStatus)
);

/**
 * @swagger
 * /savings-goals/{id}:
 *   delete:
 *     tags: [Finance - Savings Goals]
 *     summary: Delete savings goal and its contributions
 */
router.delete('/:id', asyncHandler(savingsGoalController.deleteSavingsGoal));

/**
 * @swagger
 * /savings-goals/{id}/contributions:
 *   post:
 *     tags: [Finance - Savings Goals]
 *     summary: Add a contribution to a savings goal
 */
router.post(
  '/:id/contributions',
  validate(addContributionSchema),
  asyncHandler(savingsGoalController.addContribution)
);

/**
 * @swagger
 * /savings-goals/{id}/contributions:
 *   get:
 *     tags: [Finance - Savings Goals]
 *     summary: List contributions for a savings goal
 */
router.get(
  '/:id/contributions',
  asyncHandler(savingsGoalController.getContributions)
);

/**
 * @swagger
 * /savings-goals/{goalId}/contributions/{contributionId}:
 *   delete:
 *     tags: [Finance - Savings Goals]
 *     summary: Delete a contribution
 */
router.delete(
  '/:goalId/contributions/:contributionId',
  asyncHandler(savingsGoalController.deleteContribution)
);

export default router;
