import { Router } from 'express';
import { authenticate } from '../middleware/authMiddleware.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { sendSuccess } from '../utils/apiResponse.js';

const router = Router();
router.use(authenticate);

router.get('/', asyncHandler(async (req, res) => {
  sendSuccess(res, { message: 'Budgets endpoint ready. Implementation in Phase 3.', data: [] });
}));
router.post('/', asyncHandler(async (req, res) => {
  sendSuccess(res, { message: 'Create budget endpoint ready. Implementation in Phase 3.' });
}));
router.get('/:id', asyncHandler(async (req, res) => {
  sendSuccess(res, { message: 'Get budget endpoint ready.' });
}));
router.patch('/:id', asyncHandler(async (req, res) => {
  sendSuccess(res, { message: 'Update budget endpoint ready.' });
}));
router.delete('/:id', asyncHandler(async (req, res) => {
  sendSuccess(res, { message: 'Delete budget endpoint ready.' });
}));

export default router;

