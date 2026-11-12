import mongoose from 'mongoose';
import Transaction from '../models/Transaction.js';
import FinanceCategory from '../models/FinanceCategory.js';
import { AppError } from '../utils/AppError.js';

/**
 * Validate category exists and is permitted for user and transaction type
 */
const validateCategoryForTransaction = async (categoryId, userId, transactionType) => {
  const category = await FinanceCategory.findById(categoryId);
  if (!category || !category.isActive) {
    throw new AppError('Category not found', 404, 'CATEGORY_NOT_FOUND');
  }

  // Must be system category or owned by user
  if (!category.isSystem && category.user?.toString() !== userId.toString()) {
    throw new AppError('Category not found or unauthorized', 404, 'CATEGORY_NOT_FOUND');
  }

  // Type compatibility check
  if (transactionType && category.type !== 'BOTH' && category.type !== transactionType.toUpperCase()) {
    throw new AppError(
      `Category '${category.name}' is designated for ${category.type} transactions only`,
      400,
      'CATEGORY_TYPE_MISMATCH'
    );
  }

  return category;
};

/**
 * Create a new income or expense transaction
 */
export const createTransaction = async (userId, data) => {
  const normalizedType = data.type.toUpperCase();

  // Validate category
  await validateCategoryForTransaction(data.category, userId, normalizedType);

  const transaction = await Transaction.create({
    ...data,
    type: normalizedType,
    user: userId,
  });

  return await transaction.populate('category', 'name type icon color isSystem');
};

/**
 * List transactions with filtering, search, pagination, and summary
 */
export const getTransactions = async (userId, query) => {
  const page = Math.max(1, parseInt(query.page, 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(query.limit, 10) || 20));
  const skip = (page - 1) * limit;

  // Strict user isolation filter
  const filter = {
    user: new mongoose.Types.ObjectId(userId.toString()),
  };

  // Filter by Type
  if (query.type) {
    filter.type = query.type.toUpperCase();
  }

  // Filter by Category
  if (query.category) {
    filter.category = new mongoose.Types.ObjectId(query.category.toString());
  }

  // Filter by Payment Method
  if (query.paymentMethod) {
    filter.paymentMethod = query.paymentMethod.toUpperCase().trim().replace(/[\s-]+/g, '_');
  }

  // Filter by Date Range
  if (query.startDate || query.endDate) {
    filter.transactionDate = {};
    if (query.startDate) {
      filter.transactionDate.$gte = new Date(query.startDate);
    }
    if (query.endDate) {
      const end = new Date(query.endDate);
      // If time is midnight, set to end of day
      if (end.getHours() === 0 && end.getMinutes() === 0) {
        end.setHours(23, 59, 59, 999);
      }
      filter.transactionDate.$lte = end;
    }
  }

  // Filter by Amount Range
  if (query.minAmount !== undefined || query.maxAmount !== undefined) {
    filter.amount = {};
    if (query.minAmount !== undefined && !isNaN(Number(query.minAmount))) {
      filter.amount.$gte = mongoose.Types.Decimal128.fromString(Number(query.minAmount).toFixed(2));
    }
    if (query.maxAmount !== undefined && !isNaN(Number(query.maxAmount))) {
      filter.amount.$lte = mongoose.Types.Decimal128.fromString(Number(query.maxAmount).toFixed(2));
    }
  }

  // Search by title, merchant, and description
  if (query.search && query.search.trim()) {
    const s = query.search.trim();
    filter.$or = [
      { title: { $regex: s, $options: 'i' } },
      { merchant: { $regex: s, $options: 'i' } },
      { description: { $regex: s, $options: 'i' } },
      { tags: { $in: [new RegExp(s, 'i')] } },
    ];
  }

  // Sorting
  const sortByField = query.sortBy === 'amount' ? 'amount' : 'transactionDate';
  const sortDirection = query.sortOrder === 'asc' ? 1 : -1;
  const sort = { [sortByField]: sortDirection, _id: -1 };

  // Run transactions query and count in parallel
  const [transactions, total, summaryAggregation] = await Promise.all([
    Transaction.find(filter)
      .populate('category', 'name type icon color isSystem')
      .sort(sort)
      .skip(skip)
      .limit(limit),
    Transaction.countDocuments(filter),
    Transaction.aggregate([
      { $match: { user: new mongoose.Types.ObjectId(userId.toString()) } },
      {
        $group: {
          _id: '$type',
          total: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
    ]),
  ]);

  let totalIncome = 0;
  let totalExpenses = 0;
  for (const group of summaryAggregation) {
    const val = parseFloat(group.total?.toString() || '0');
    if (group._id === 'INCOME') totalIncome += val;
    if (group._id === 'EXPENSE') totalExpenses += val;
  }

  return {
    transactions,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
    },
    summary: {
      totalIncome: Math.round(totalIncome * 100) / 100,
      totalExpenses: Math.round(totalExpenses * 100) / 100,
      netBalance: Math.round((totalIncome - totalExpenses) * 100) / 100,
    },
  };
};

/**
 * Get single transaction by ID with user ownership check
 */
export const getTransactionById = async (transactionId, userId) => {
  const transaction = await Transaction.findOne({
    _id: transactionId,
    user: userId,
  }).populate('category', 'name type icon color isSystem');

  if (!transaction) {
    throw new AppError('Transaction not found', 404, 'TRANSACTION_NOT_FOUND');
  }

  return transaction;
};

/**
 * Update transaction with strict user ownership and category validation
 */
export const updateTransaction = async (transactionId, userId, updateData) => {
  const transaction = await Transaction.findOne({
    _id: transactionId,
    user: userId,
  });

  if (!transaction) {
    throw new AppError('Transaction not found', 404, 'TRANSACTION_NOT_FOUND');
  }

  const targetType = (updateData.type ? updateData.type.toUpperCase() : transaction.type);

  if (updateData.category) {
    await validateCategoryForTransaction(updateData.category, userId, targetType);
    transaction.category = updateData.category;
  } else if (updateData.type && updateData.type.toUpperCase() !== transaction.type) {
    // If type changed without changing category, re-validate existing category
    await validateCategoryForTransaction(transaction.category, userId, targetType);
  }

  if (updateData.type) transaction.type = targetType;
  if (updateData.amount !== undefined) {
    transaction.amount = mongoose.Types.Decimal128.fromString(Number(updateData.amount).toFixed(2));
  }
  if (updateData.currency) transaction.currency = updateData.currency;
  if (updateData.title) transaction.title = updateData.title.trim();
  if (updateData.description !== undefined) transaction.description = updateData.description.trim();
  if (updateData.merchant !== undefined) transaction.merchant = updateData.merchant ? updateData.merchant.trim() : null;
  if (updateData.paymentMethod) transaction.paymentMethod = updateData.paymentMethod;
  if (updateData.transactionDate) transaction.transactionDate = updateData.transactionDate;
  if (updateData.receiptUrl !== undefined) transaction.receiptUrl = updateData.receiptUrl;
  if (updateData.tags !== undefined) transaction.tags = updateData.tags;
  if (updateData.notes !== undefined) transaction.notes = updateData.notes;
  if (updateData.isFoodExpense !== undefined) transaction.isFoodExpense = updateData.isFoodExpense;
  if (updateData.location !== undefined) transaction.location = updateData.location;

  await transaction.save();
  return await transaction.populate('category', 'name type icon color isSystem');
};

/**
 * Delete transaction by ID with ownership enforcement
 */
export const deleteTransaction = async (transactionId, userId) => {
  const transaction = await Transaction.findOneAndDelete({
    _id: transactionId,
    user: userId,
  });

  if (!transaction) {
    throw new AppError('Transaction not found', 404, 'TRANSACTION_NOT_FOUND');
  }

  return { message: 'Transaction deleted successfully' };
};

