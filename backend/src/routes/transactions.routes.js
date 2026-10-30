import { Router } from 'express';
import { authenticate } from '../middleware/authMiddleware.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { sendSuccess } from '../utils/apiResponse.js';
import { validate } from '../middleware/validate.js';
import { createTransactionSchema, transactionQuerySchema } from '../validators/schemas.js';

const router = Router();

// All routes require authentication
router.use(authenticate);

/**
 * @swagger
 * /finance/transactions:
 *   get:
 *     tags: [Finance - Transactions]
 *     summary: List transactions with pagination and filtering
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 20 }
 *       - in: query
 *         name: type
 *         schema: { type: string, enum: [income, expense, transfer] }
 *       - in: query
 *         name: startDate
 *         schema: { type: string, format: date }
 *       - in: query
 *         name: endDate
 *         schema: { type: string, format: date }
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Paginated list of transactions
 */
router.get(
  '/',
  validate(transactionQuerySchema, 'query'),
  asyncHandler(async (req, res) => {
    sendSuccess(res, {
      message: 'Transactions endpoint ready. Implementation in Phase 3.',
      data: [],
      pagination: { total: 0, page: 1, limit: 20, totalPages: 0 },
    });
  })
);

/**
 * @swagger
 * /finance/transactions:
 *   post:
 *     tags: [Finance - Transactions]
 *     summary: Create a new transaction
 */
router.post(
  '/',
  validate(createTransactionSchema),
  asyncHandler(async (req, res) => {
    sendSuccess(res, {
      status: 201,
      message: 'Create transaction endpoint ready. Implementation in Phase 3.',
      data: req.body,
    });
  })
);

router.get('/:id', asyncHandler(async (req, res) => {
  sendSuccess(res, { message: 'Get transaction endpoint ready. Implementation in Phase 3.' });
}));

router.patch('/:id', asyncHandler(async (req, res) => {
  sendSuccess(res, { message: 'Update transaction endpoint ready. Implementation in Phase 3.' });
}));

router.delete('/:id', asyncHandler(async (req, res) => {
  sendSuccess(res, { message: 'Delete transaction endpoint ready. Implementation in Phase 3.' });
}));

export default router;

