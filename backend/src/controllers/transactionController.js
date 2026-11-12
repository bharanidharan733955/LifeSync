import * as transactionService from '../services/transactionService.js';
import { sendSuccess } from '../utils/apiResponse.js';

export const getTransactions = async (req, res) => {
  const result = await transactionService.getTransactions(req.userId, req.query);
  const body = {
    success: true,
    message: 'Transactions retrieved successfully',
    data: result.transactions,
    pagination: result.pagination,
    summary: result.summary,
  };
  return res.status(200).json(body);
};

export const getTransactionById = async (req, res) => {
  const transaction = await transactionService.getTransactionById(req.params.id, req.userId);
  sendSuccess(res, {
    message: 'Transaction retrieved successfully',
    data: transaction,
  });
};

export const createTransaction = async (req, res) => {
  const transaction = await transactionService.createTransaction(req.userId, req.body);
  sendSuccess(res, {
    status: 201,
    message: 'Transaction created successfully',
    data: transaction,
  });
};

export const updateTransaction = async (req, res) => {
  const transaction = await transactionService.updateTransaction(req.params.id, req.userId, req.body);
  sendSuccess(res, {
    message: 'Transaction updated successfully',
    data: transaction,
  });
};

export const deleteTransaction = async (req, res) => {
  const result = await transactionService.deleteTransaction(req.params.id, req.userId);
  sendSuccess(res, {
    message: result.message,
    data: null,
  });
};

