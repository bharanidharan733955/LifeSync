import { Router } from 'express';
import { authenticate } from '../middleware/authMiddleware.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { validate } from '../middleware/validate.js';
import {
  createTransactionSchema,
  updateTransactionSchema,
  transactionQuerySchema,
} from '../validators/schemas.js';
import * as transactionController from '../controllers/transactionController.js';

const router = Router();

// All transaction routes require authentication
router.use(authenticate);

/**
 * @swagger
 * /transactions:
 *   get:
 *     tags: [Finance - Transactions]
 *     summary: List transactions with pagination, filtering, search, and summary
 */
router.get(
  '/',
  validate(transactionQuerySchema, 'query'),
  asyncHandler(transactionController.getTransactions)
);

/**
 * @swagger
 * /transactions:
 *   post:
 *     tags: [Finance - Transactions]
 *     summary: Create a new income or expense transaction
 */
router.post(
  '/',
  validate(createTransactionSchema),
  asyncHandler(transactionController.createTransaction)
);

/**
 * @swagger
 * /transactions/{id}:
 *   get:
 *     tags: [Finance - Transactions]
 *     summary: Get single transaction by ID
 */
router.get('/:id', asyncHandler(transactionController.getTransactionById));

/**
 * @swagger
 * /transactions/{id}:
 *   put:
 *     tags: [Finance - Transactions]
 *     summary: Update transaction by ID
 */
router.put(
  '/:id',
  validate(updateTransactionSchema),
  asyncHandler(transactionController.updateTransaction)
);

router.patch(
  '/:id',
  validate(updateTransactionSchema),
  asyncHandler(transactionController.updateTransaction)
);

/**
 * @swagger
 * /transactions/{id}:
 *   delete:
 *     tags: [Finance - Transactions]
 *     summary: Delete transaction by ID
 */
router.delete('/:id', asyncHandler(transactionController.deleteTransaction));

export default router;
