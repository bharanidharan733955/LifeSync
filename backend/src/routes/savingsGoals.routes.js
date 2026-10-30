import { Router } from 'express';
import { authenticate } from '../middleware/authMiddleware.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { sendSuccess } from '../utils/apiResponse.js';

const router = Router();
router.use(authenticate);

router.get('/', asyncHandler(async (req, res) => {
  sendSuccess(res, { message: 'Savings goals endpoint ready. Implementation in Phase 3.', data: [] });
}));
router.post('/', asyncHandler(async (req, res) => {
  sendSuccess(res, { message: 'Create savings goal endpoint ready.' });
}));
router.get('/:id', asyncHandler(async (req, res) => {
  sendSuccess(res, { message: 'Get savings goal endpoint ready.' });
}));
router.patch('/:id', asyncHandler(async (req, res) => {
  sendSuccess(res, { message: 'Update savings goal endpoint ready.' });
}));
router.delete('/:id', asyncHandler(async (req, res) => {
  sendSuccess(res, { message: 'Delete savings goal endpoint ready.' });
}));
router.post('/:id/contribute', asyncHandler(async (req, res) => {
  sendSuccess(res, { message: 'Add contribution endpoint ready.' });
}));

export default router;

