import { Router } from 'express';
import { authenticate } from '../middleware/authMiddleware.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { validate } from '../middleware/validate.js';
import {
  createBudgetSchema,
  updateBudgetSchema,
  budgetQuerySchema,
} from '../validators/schemas.js';
import * as budgetController from '../controllers/budgetController.js';

const router = Router();

// All budget routes require authentication
router.use(authenticate);

/**
 * @swagger
 * /budgets/summary:
 *   get:
 *     tags: [Finance - Budgets]
 *     summary: Get overall budget summary with progress across all active budgets
 */
router.get('/summary', asyncHandler(budgetController.getBudgetSummary));

/**
 * @swagger
 * /budgets:
 *   get:
 *     tags: [Finance - Budgets]
 *     summary: List user budgets with live spending progress and filtering
 */
router.get(
  '/',
  validate(budgetQuerySchema, 'query'),
  asyncHandler(budgetController.getBudgets)
);

/**
 * @swagger
 * /budgets:
 *   post:
 *     tags: [Finance - Budgets]
 *     summary: Create a new category or overall budget
 */
router.post(
  '/',
  validate(createBudgetSchema),
  asyncHandler(budgetController.createBudget)
);

/**
 * @swagger
 * /budgets/{id}/progress:
 *   get:
 *     tags: [Finance - Budgets]
 *     summary: Get detailed progress and transactions for a specific budget
 */
router.get('/:id/progress', asyncHandler(budgetController.getBudgetProgress));

/**
 * @swagger
 * /budgets/{id}:
 *   get:
 *     tags: [Finance - Budgets]
 *     summary: Get budget details by ID
 */
router.get('/:id', asyncHandler(budgetController.getBudgetById));

/**
 * @swagger
 * /budgets/{id}:
 *   put:
 *     tags: [Finance - Budgets]
 *     summary: Update budget
 */
router.put(
  '/:id',
  validate(updateBudgetSchema),
  asyncHandler(budgetController.updateBudget)
);

router.patch(
  '/:id',
  validate(updateBudgetSchema),
  asyncHandler(budgetController.updateBudget)
);

/**
 * @swagger
 * /budgets/{id}:
 *   delete:
 *     tags: [Finance - Budgets]
 *     summary: Delete budget
 */
router.delete('/:id', asyncHandler(budgetController.deleteBudget));

export default router;
