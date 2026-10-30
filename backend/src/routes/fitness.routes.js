import { Router } from 'express';
import { authenticate } from '../middleware/authMiddleware.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { sendSuccess } from '../utils/apiResponse.js';

const router = Router();
router.use(authenticate);

// Weight tracking
router.get('/weight', asyncHandler(async (req, res) => {
  sendSuccess(res, { message: 'Weight logs endpoint ready. Implementation in Phase 6.', data: [] });
}));
router.post('/weight', asyncHandler(async (req, res) => {
  sendSuccess(res, { message: 'Log weight endpoint ready.' });
}));
router.delete('/weight/:id', asyncHandler(async (req, res) => {
  sendSuccess(res, { message: 'Delete weight log endpoint ready.' });
}));

// Activity tracking
router.get('/activities', asyncHandler(async (req, res) => {
  sendSuccess(res, { message: 'Activity logs endpoint ready.', data: [] });
}));
router.post('/activities', asyncHandler(async (req, res) => {
  sendSuccess(res, { message: 'Log activity endpoint ready.' });
}));
router.delete('/activities/:id', asyncHandler(async (req, res) => {
  sendSuccess(res, { message: 'Delete activity log endpoint ready.' });
}));

export default router;

