import { Router } from 'express';
import { authenticate } from '../middleware/authMiddleware.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { sendSuccess } from '../utils/apiResponse.js';

const router = Router();
router.use(authenticate);

router.get('/', asyncHandler(async (req, res) => {
  sendSuccess(res, { message: 'Diet plans endpoint ready. Implementation in Phase 6.', data: [] });
}));
router.post('/', asyncHandler(async (req, res) => {
  sendSuccess(res, { message: 'Create diet plan endpoint ready.' });
}));
router.get('/:id', asyncHandler(async (req, res) => {
  sendSuccess(res, { message: 'Get diet plan endpoint ready.' });
}));
router.put('/:id', asyncHandler(async (req, res) => {
  sendSuccess(res, { message: 'Update diet plan endpoint ready.' });
}));
router.delete('/:id', asyncHandler(async (req, res) => {
  sendSuccess(res, { message: 'Delete diet plan endpoint ready.' });
}));
router.post('/:id/generate-grocery-list', asyncHandler(async (req, res) => {
  sendSuccess(res, { message: 'Generate grocery list from diet plan endpoint ready.' });
}));

export default router;

