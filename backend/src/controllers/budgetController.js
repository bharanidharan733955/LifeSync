import * as budgetService from '../services/budgetService.js';
import { sendSuccess } from '../utils/apiResponse.js';

export const getBudgets = async (req, res) => {
  const result = await budgetService.getBudgets(req.userId, req.query);
  sendSuccess(res, {
    message: 'Budgets retrieved successfully',
    data: result.budgets,
    pagination: result.pagination,
  });
};

export const getBudgetSummary = async (req, res) => {
  const result = await budgetService.getBudgetSummary(req.userId);
  sendSuccess(res, {
    message: 'Budget summary retrieved successfully',
    data: result,
  });
};

export const getBudgetById = async (req, res) => {
  const budget = await budgetService.getBudgetById(req.params.id, req.userId);
  sendSuccess(res, {
    message: 'Budget retrieved successfully',
    data: budget,
  });
};

export const getBudgetProgress = async (req, res) => {
  const result = await budgetService.getBudgetProgress(req.params.id, req.userId);
  sendSuccess(res, {
    message: 'Budget progress retrieved successfully',
    data: result,
  });
};

export const createBudget = async (req, res) => {
  const budget = await budgetService.createBudget(req.userId, req.body);
  sendSuccess(res, {
    status: 201,
    message: 'Budget created successfully',
    data: budget,
  });
};

export const updateBudget = async (req, res) => {
  const budget = await budgetService.updateBudget(req.params.id, req.userId, req.body);
  sendSuccess(res, {
    message: 'Budget updated successfully',
    data: budget,
  });
};

export const deleteBudget = async (req, res) => {
  const result = await budgetService.deleteBudget(req.params.id, req.userId);
  sendSuccess(res, {
    message: result.message,
    data: null,
  });
};

