import { Router } from 'express';
import { authenticate } from '../middleware/authMiddleware.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { sendSuccess } from '../utils/apiResponse.js';

const router = Router();
router.use(authenticate);

router.post('/request', asyncHandler(async (req, res) => {
  sendSuccess(res, { message: 'Request report endpoint ready. Implementation in Phase 3.', data: { status: 'pending' } });
}));
router.get('/', asyncHandler(async (req, res) => {
  sendSuccess(res, { message: 'List reports endpoint ready.', data: [] });
}));
router.get('/:id/download', asyncHandler(async (req, res) => {
  sendSuccess(res, { message: 'Download report endpoint ready.' });
}));
router.get('/:id/status', asyncHandler(async (req, res) => {
  sendSuccess(res, { message: 'Report status endpoint ready.', data: { status: 'pending' } });
}));

export default router;

