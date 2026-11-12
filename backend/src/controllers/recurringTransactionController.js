import * as recurringService from '../services/recurringTransactionService.js';
import { sendSuccess } from '../utils/apiResponse.js';

export const getRecurringTransactions = async (req, res) => {
  const recurring = await recurringService.getRecurringTransactions(req.userId, req.query);
  sendSuccess(res, {
    message: 'Recurring transactions retrieved successfully',
    data: recurring,
  });
};

export const getRecurringTransactionById = async (req, res) => {
  const recurring = await recurringService.getRecurringTransactionById(req.params.id, req.userId);
  sendSuccess(res, {
    message: 'Recurring transaction retrieved successfully',
    data: recurring,
  });
};

export const createRecurringTransaction = async (req, res) => {
  const recurring = await recurringService.createRecurringTransaction(req.body, req.userId);
  sendSuccess(res, {
    status: 201,
    message: 'Recurring transaction created successfully',
    data: recurring,
  });
};

export const updateRecurringTransaction = async (req, res) => {
  const recurring = await recurringService.updateRecurringTransaction(
    req.params.id,
    req.body,
    req.userId
  );
  sendSuccess(res, {
    message: 'Recurring transaction updated successfully',
    data: recurring,
  });
};

export const toggleRecurringStatus = async (req, res) => {
  const recurring = await recurringService.toggleRecurringStatus(
    req.params.id,
    req.userId,
    req.body.isActive
  );
  sendSuccess(res, {
    message: `Recurring transaction ${req.body.isActive ? 'resumed' : 'paused'} successfully`,
    data: recurring,
  });
};

export const deleteRecurringTransaction = async (req, res) => {
  const result = await recurringService.deleteRecurringTransaction(req.params.id, req.userId);
  sendSuccess(res, {
    message: result.message,
    data: result,
  });
};

export const getRecurringHistory = async (req, res) => {
  const result = await recurringService.getRecurringHistory(req.params.id, req.userId, req.query);
  sendSuccess(res, {
    message: 'Recurring transaction history retrieved successfully',
    data: result.transactions,
    recurring: result.recurring,
    pagination: result.pagination,
  });
};

export const processDueRecurring = async (req, res) => {
  const result = await recurringService.generateDueTransactions();
  sendSuccess(res, {
    message: 'Due recurring transactions processed successfully',
    data: result,
  });
};

