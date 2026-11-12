import { Router } from 'express';
import { authenticate } from '../middleware/authMiddleware.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { validate } from '../middleware/validate.js';
import { createCategorySchema, updateCategorySchema } from '../validators/schemas.js';
import * as categoryController from '../controllers/categoryController.js';

const router = Router();

// All category routes require authentication
router.use(authenticate);

/**
 * @swagger
 * /categories:
 *   get:
 *     tags: [Finance - Categories]
 *     summary: Get all available categories (system + user custom)
 */
router.get('/', asyncHandler(categoryController.getCategories));

/**
 * @swagger
 * /categories/{id}:
 *   get:
 *     tags: [Finance - Categories]
 *     summary: Get category by ID
 */
router.get('/:id', asyncHandler(categoryController.getCategoryById));

/**
 * @swagger
 * /categories:
 *   post:
 *     tags: [Finance - Categories]
 *     summary: Create custom user category
 */
router.post(
  '/',
  validate(createCategorySchema),
  asyncHandler(categoryController.createCategory)
);

/**
 * @swagger
 * /categories/{id}:
 *   put:
 *     tags: [Finance - Categories]
 *     summary: Update custom user category
 */
router.put(
  '/:id',
  validate(updateCategorySchema),
  asyncHandler(categoryController.updateCategory)
);

router.patch(
  '/:id',
  validate(updateCategorySchema),
  asyncHandler(categoryController.updateCategory)
);

/**
 * @swagger
 * /categories/{id}:
 *   delete:
 *     tags: [Finance - Categories]
 *     summary: Delete custom user category
 */
router.delete('/:id', asyncHandler(categoryController.deleteCategory));

export default router;
