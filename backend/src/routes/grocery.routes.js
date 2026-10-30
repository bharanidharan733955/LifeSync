import { Router } from 'express';
import { authenticate } from '../middleware/authMiddleware.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { sendSuccess } from '../utils/apiResponse.js';

const router = Router();
router.use(authenticate);

// Grocery lists
router.get('/lists', asyncHandler(async (req, res) => {
  sendSuccess(res, { message: 'Grocery lists endpoint ready. Implementation in Phase 6.', data: [] });
}));
router.post('/lists', asyncHandler(async (req, res) => {
  sendSuccess(res, { message: 'Create grocery list endpoint ready.' });
}));
router.get('/lists/:id', asyncHandler(async (req, res) => {
  sendSuccess(res, { message: 'Get grocery list endpoint ready.' });
}));
router.patch('/lists/:id', asyncHandler(async (req, res) => {
  sendSuccess(res, { message: 'Update grocery list endpoint ready.' });
}));
router.delete('/lists/:id', asyncHandler(async (req, res) => {
  sendSuccess(res, { message: 'Delete grocery list endpoint ready.' });
}));

// Grocery items
router.post('/lists/:id/items', asyncHandler(async (req, res) => {
  sendSuccess(res, { message: 'Add grocery item endpoint ready.' });
}));
router.patch('/lists/:listId/items/:itemId', asyncHandler(async (req, res) => {
  sendSuccess(res, { message: 'Update grocery item endpoint ready.' });
}));
router.delete('/lists/:listId/items/:itemId', asyncHandler(async (req, res) => {
  sendSuccess(res, { message: 'Delete grocery item endpoint ready.' });
}));
router.patch('/lists/:listId/items/:itemId/toggle', asyncHandler(async (req, res) => {
  sendSuccess(res, { message: 'Toggle grocery item purchased endpoint ready.' });
}));

export default router;

