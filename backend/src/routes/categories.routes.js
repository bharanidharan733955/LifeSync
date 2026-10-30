import { Router } from 'express';
import { authenticate } from '../middleware/authMiddleware.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { sendSuccess } from '../utils/apiResponse.js';

const router = Router();
router.use(authenticate);

router.get('/', asyncHandler(async (req, res) => {
  sendSuccess(res, { message: 'Categories endpoint ready. Implementation in Phase 3.', data: [] });
}));

router.post('/', asyncHandler(async (req, res) => {
  sendSuccess(res, { message: 'Create category endpoint ready. Implementation in Phase 3.' });
}));

router.patch('/:id', asyncHandler(async (req, res) => {
  sendSuccess(res, { message: 'Update category endpoint ready.' });
}));

router.delete('/:id', asyncHandler(async (req, res) => {
  sendSuccess(res, { message: 'Delete category endpoint ready.' });
}));

export default router;

