import { Router } from 'express';
import { authenticate } from '../middleware/authMiddleware.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { sendSuccess } from '../utils/apiResponse.js';

const router = Router();
router.use(authenticate);

router.get('/', asyncHandler(async (req, res) => {
  sendSuccess(res, { message: 'Notifications endpoint ready.', data: [] });
}));
router.patch('/:id/read', asyncHandler(async (req, res) => {
  sendSuccess(res, { message: 'Mark notification read endpoint ready.' });
}));
router.patch('/read-all', asyncHandler(async (req, res) => {
  sendSuccess(res, { message: 'Mark all notifications read endpoint ready.' });
}));
router.delete('/:id', asyncHandler(async (req, res) => {
  sendSuccess(res, { message: 'Delete notification endpoint ready.' });
}));
router.post('/device-token', asyncHandler(async (req, res) => {
  sendSuccess(res, { message: 'Register device token endpoint ready.' });
}));

export default router;

