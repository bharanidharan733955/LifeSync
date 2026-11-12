import { Router } from 'express';
import { authenticate } from '../middleware/authMiddleware.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { validate } from '../middleware/validate.js';
import {
  createRecurringTransactionSchema,
  updateRecurringTransactionSchema,
  recurringStatusSchema,
} from '../validators/schemas.js';
import * as recurringController from '../controllers/recurringTransactionController.js';

const router = Router();

// All recurring transaction routes require authentication
router.use(authenticate);

/**
 * @swagger
 * /recurring-transactions:
 *   get:
 *     tags: [Finance - Recurring Transactions]
 *     summary: List all user recurring transaction schedules
 */
router.get('/', asyncHandler(recurringController.getRecurringTransactions));

/**
 * @swagger
 * /recurring-transactions:
 *   post:
 *     tags: [Finance - Recurring Transactions]
 *     summary: Create a new recurring transaction schedule
 */
router.post(
  '/',
  validate(createRecurringTransactionSchema),
  asyncHandler(recurringController.createRecurringTransaction)
);

/**
 * @swagger
 * /recurring-transactions/process-due:
 *   post:
 *     tags: [Finance - Recurring Transactions]
 *     summary: Manually trigger processing of due recurring transactions
 */
router.post('/process-due', asyncHandler(recurringController.processDueRecurring));

/**
 * @swagger
 * /recurring-transactions/{id}:
 *   get:
 *     tags: [Finance - Recurring Transactions]
 *     summary: Get single recurring transaction schedule details
 */
router.get('/:id', asyncHandler(recurringController.getRecurringTransactionById));

/**
 * @swagger
 * /recurring-transactions/{id}:
 *   put:
 *     tags: [Finance - Recurring Transactions]
 *     summary: Update recurring transaction schedule
 */
router.put(
  '/:id',
  validate(updateRecurringTransactionSchema),
  asyncHandler(recurringController.updateRecurringTransaction)
);

/**
 * @swagger
 * /recurring-transactions/{id}/status:
 *   patch:
 *     tags: [Finance - Recurring Transactions]
 *     summary: Pause or resume a recurring transaction schedule
 */
router.patch(
  '/:id/status',
  validate(recurringStatusSchema),
  asyncHandler(recurringController.toggleRecurringStatus)
);

/**
 * @swagger
 * /recurring-transactions/{id}:
 *   delete:
 *     tags: [Finance - Recurring Transactions]
 *     summary: Delete a recurring transaction schedule
 */
router.delete('/:id', asyncHandler(recurringController.deleteRecurringTransaction));

/**
 * @swagger
 * /recurring-transactions/{id}/history:
 *   get:
 *     tags: [Finance - Recurring Transactions]
 *     summary: Get history of generated transactions from this recurring rule
 */
router.get('/:id/history', asyncHandler(recurringController.getRecurringHistory));

export default router;

