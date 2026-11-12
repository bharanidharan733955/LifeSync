import * as categoryService from '../services/categoryService.js';
import { sendSuccess } from '../utils/apiResponse.js';

export const getCategories = async (req, res) => {
  const categories = await categoryService.getCategories(req.userId, req.query.type);
  sendSuccess(res, {
    message: 'Categories fetched successfully',
    data: categories,
  });
};

export const getCategoryById = async (req, res) => {
  const category = await categoryService.getCategoryById(req.params.id, req.userId);
  sendSuccess(res, {
    message: 'Category retrieved successfully',
    data: category,
  });
};

export const createCategory = async (req, res) => {
  const category = await categoryService.createCategory(req.userId, req.body);
  sendSuccess(res, {
    status: 201,
    message: 'Category created successfully',
    data: category,
  });
};

export const updateCategory = async (req, res) => {
  const category = await categoryService.updateCategory(req.params.id, req.userId, req.body);
  sendSuccess(res, {
    message: 'Category updated successfully',
    data: category,
  });
};

export const deleteCategory = async (req, res) => {
  const result = await categoryService.deleteCategory(req.params.id, req.userId);
  sendSuccess(res, {
    message: result.message,
    data: null,
  });
};

