import mongoose from 'mongoose';
import Budget from '../models/Budget.js';
import Transaction from '../models/Transaction.js';
import FinanceCategory from '../models/FinanceCategory.js';
import { AppError } from '../utils/AppError.js';
import { computeBudgetDates, getMonthRange } from '../utils/dateUtils.js';

/**
 * Validate category is active, accessible by user, and supports expenses
 */
const validateCategoryForBudget = async (categoryId, userId) => {
  const category = await FinanceCategory.findById(categoryId);
  if (!category || !category.isActive) {
    throw new AppError('Category not found', 404, 'CATEGORY_NOT_FOUND');
  }

  // Must be system category or owned by user
  if (!category.isSystem && category.user?.toString() !== userId.toString()) {
    throw new AppError('Category not found or unauthorized', 404, 'CATEGORY_NOT_FOUND');
  }

  // Must support EXPENSE
  if (category.type !== 'EXPENSE' && category.type !== 'BOTH') {
    throw new AppError(
      `Category '${category.name}' cannot be used for expense budgets (it is designated for ${category.type})`,
      400,
      'INVALID_CATEGORY_TYPE'
    );
  }

  return category;
};

/**
 * Calculate live progress for a budget against actual EXPENSE transactions.
 * Excludes all INCOME transactions.
 */
export const calculateBudgetProgress = async (budget, userId) => {
  const userObjectId = new mongoose.Types.ObjectId(userId.toString());

  const matchQuery = {
    user: userObjectId,
    type: 'EXPENSE',
    currency: budget.currency || 'INR',
    transactionDate: {
      $gte: new Date(budget.startDate),
      $lte: new Date(budget.endDate),
    },
  };

  // If CATEGORY budget, match category
  if (budget.budgetType === 'CATEGORY' && budget.category) {
    const catId = budget.category._id || budget.category;
    matchQuery.category = new mongoose.Types.ObjectId(catId.toString());
  }

  const agg = await Transaction.aggregate([
    { $match: matchQuery },
    {
      $group: {
        _id: null,
        spent: { $sum: '$amount' },
        count: { $sum: 1 },
      },
    },
  ]);

  const budgetAmount = parseFloat(budget.amount?.toString() || '0');
  const spentAmount = agg.length > 0 ? parseFloat(agg[0].spent?.toString() || '0') : 0;
  const transactionCount = agg.length > 0 ? agg[0].count : 0;

  const roundedSpent = Math.round(spentAmount * 100) / 100;
  const remainingAmount = Math.round((budgetAmount - roundedSpent) * 100) / 100;

  // Percentage used (do not cap at 100)
  const percentageUsed = budgetAmount > 0
    ? Math.round((roundedSpent / budgetAmount) * 10000) / 100
    : 0;

  const percentageRemaining = Math.max(0, Math.round((100 - percentageUsed) * 100) / 100);

  const alertThreshold = budget.alertThreshold || 80;
  const thresholdReached = percentageUsed >= alertThreshold;
  const exceededBudget = roundedSpent > budgetAmount;

  const now = new Date();
  const endDate = new Date(budget.endDate);
  const isExpired = endDate < now;
  const msRemaining = endDate.getTime() - now.getTime();
  const daysRemaining = isExpired ? 0 : Math.ceil(msRemaining / (1000 * 60 * 60 * 24));

  let status = 'NORMAL';
  if (exceededBudget) {
    status = 'EXCEEDED';
  } else if (thresholdReached) {
    status = 'WARNING';
  } else if (isExpired) {
    status = 'EXPIRED';
  }

  return {
    budgetAmount,
    spentAmount: roundedSpent,
    remainingAmount,
    percentageUsed,
    percentageRemaining,
    thresholdReached,
    exceededBudget,
    transactionCount,
    startDate: budget.startDate,
    endDate: budget.endDate,
    daysRemaining,
    status,
    alertThreshold,
  };
};

/**
 * Create a new budget
 */
export const createBudget = async (userId, data) => {
  const normType = (data.budgetType || 'CATEGORY').toUpperCase();
  const normPeriod = (data.period || 'MONTHLY').toUpperCase();

  // Validate category if CATEGORY budget
  let categoryId = null;
  if (normType === 'CATEGORY') {
    if (!data.category) {
      throw new AppError('Category is required for CATEGORY budget', 400, 'CATEGORY_REQUIRED');
    }
    const cat = await validateCategoryForBudget(data.category, userId);
    categoryId = cat._id;
  }

  // Compute dates if not provided
  const { startDate, endDate } = computeBudgetDates(normPeriod, data.startDate, data.endDate);

  // Check duplicate active budget overlapping in the same period
  const existingOverlap = await Budget.findOne({
    user: userId,
    isActive: true,
    budgetType: normType,
    category: categoryId,
    startDate: { $lte: endDate },
    endDate: { $gte: startDate },
  });

  if (existingOverlap) {
    throw new AppError(
      `An active ${normType.toLowerCase()} budget already covers this date period. Please edit or delete the existing budget.`,
      409,
      'BUDGET_OVERLAP'
    );
  }

  const budget = await Budget.create({
    user: userId,
    name: data.name.trim(),
    budgetType: normType,
    category: categoryId,
    amount: data.amount,
    currency: (data.currency || 'INR').toUpperCase(),
    period: normPeriod,
    startDate,
    endDate,
    alertThreshold: data.alertThreshold || 80,
    isActive: data.isActive !== undefined ? data.isActive : true,
    notes: data.notes?.trim() || null,
  });

  await budget.populate('category', 'name type icon color isSystem');
  const progress = await calculateBudgetProgress(budget, userId);

  return {
    ...budget.toJSON(),
    progress,
  };
};

/**
 * List budgets with filtering, pagination, and live progress
 */
export const getBudgets = async (userId, query = {}) => {
  const page = Math.max(1, parseInt(query.page, 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(query.limit, 10) || 20));
  const skip = (page - 1) * limit;

  const filter = {
    user: new mongoose.Types.ObjectId(userId.toString()),
  };

  if (query.budgetType) {
    filter.budgetType = query.budgetType.toUpperCase();
  }

  if (query.period) {
    filter.period = query.period.toUpperCase();
  }

  if (query.isActive !== undefined) {
    filter.isActive = query.isActive;
  }

  if (query.category) {
    filter.category = new mongoose.Types.ObjectId(query.category.toString());
  }

  if (query.search && query.search.trim()) {
    filter.name = { $regex: query.search.trim(), $options: 'i' };
  }

  const [budgets, total] = await Promise.all([
    Budget.find(filter)
      .populate('category', 'name type icon color isSystem')
      .sort({ isActive: -1, startDate: -1, createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Budget.countDocuments(filter),
  ]);

  // Calculate live progress for each budget
  const budgetsWithProgress = await Promise.all(
    budgets.map(async (b) => {
      const progress = await calculateBudgetProgress(b, userId);
      return {
        ...b.toJSON(),
        progress,
      };
    })
  );

  return {
    budgets: budgetsWithProgress,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
    },
  };
};

/**
 * Get budget by ID with ownership verification and live progress
 */
export const getBudgetById = async (budgetId, userId) => {
  const budget = await Budget.findOne({
    _id: budgetId,
    user: userId,
  }).populate('category', 'name type icon color isSystem');

  if (!budget) {
    throw new AppError('Budget not found', 404, 'BUDGET_NOT_FOUND');
  }

  const progress = await calculateBudgetProgress(budget, userId);

  return {
    ...budget.toJSON(),
    progress,
  };
};

/**
 * Get budget progress and list of qualifying transactions
 */
export const getBudgetProgress = async (budgetId, userId) => {
  const budget = await Budget.findOne({
    _id: budgetId,
    user: userId,
  }).populate('category', 'name type icon color isSystem');

  if (!budget) {
    throw new AppError('Budget not found', 404, 'BUDGET_NOT_FOUND');
  }

  const progress = await calculateBudgetProgress(budget, userId);

  // Retrieve qualifying transactions for detailed view
  const matchQuery = {
    user: new mongoose.Types.ObjectId(userId.toString()),
    type: 'EXPENSE',
    currency: budget.currency || 'INR',
    transactionDate: {
      $gte: new Date(budget.startDate),
      $lte: new Date(budget.endDate),
    },
  };

  if (budget.budgetType === 'CATEGORY' && budget.category) {
    matchQuery.category = budget.category._id || budget.category;
  }

  const transactions = await Transaction.find(matchQuery)
    .populate('category', 'name type icon color isSystem')
    .sort({ transactionDate: -1 })
    .limit(50);

  return {
    budget: budget.toJSON(),
    progress,
    transactions,
  };
};

/**
 * Update budget with ownership check and validation
 */
export const updateBudget = async (budgetId, userId, updateData) => {
  const budget = await Budget.findOne({
    _id: budgetId,
    user: userId,
  });

  if (!budget) {
    throw new AppError('Budget not found', 404, 'BUDGET_NOT_FOUND');
  }

  const targetType = updateData.budgetType
    ? updateData.budgetType.toUpperCase()
    : budget.budgetType;

  // Handle category update/clearing
  if (targetType === 'CATEGORY') {
    const targetCatId = updateData.category || budget.category;
    if (!targetCatId) {
      throw new AppError('Category is required for CATEGORY budget', 400, 'CATEGORY_REQUIRED');
    }
    const cat = await validateCategoryForBudget(targetCatId, userId);
    budget.category = cat._id;
  } else if (targetType === 'OVERALL') {
    budget.category = null;
  }

  if (updateData.name) budget.name = updateData.name.trim();
  if (updateData.budgetType) budget.budgetType = targetType;
  if (updateData.amount !== undefined) {
    budget.amount = mongoose.Types.Decimal128.fromString(Number(updateData.amount).toFixed(2));
  }
  if (updateData.currency) budget.currency = updateData.currency.toUpperCase();
  if (updateData.period) budget.period = updateData.period.toUpperCase();
  if (updateData.startDate) budget.startDate = new Date(updateData.startDate);
  if (updateData.endDate) budget.endDate = new Date(updateData.endDate);
  if (updateData.alertThreshold !== undefined) budget.alertThreshold = updateData.alertThreshold;
  if (updateData.isActive !== undefined) budget.isActive = updateData.isActive;
  if (updateData.notes !== undefined) budget.notes = updateData.notes?.trim() || null;

  if (budget.startDate >= budget.endDate) {
    throw new AppError('Start date must be before end date', 400, 'INVALID_DATE_RANGE');
  }

  await budget.save();
  await budget.populate('category', 'name type icon color isSystem');
  const progress = await calculateBudgetProgress(budget, userId);

  return {
    ...budget.toJSON(),
    progress,
  };
};

/**
 * Delete budget (does NOT delete any transactions)
 */
export const deleteBudget = async (budgetId, userId) => {
  const budget = await Budget.findOneAndDelete({
    _id: budgetId,
    user: userId,
  });

  if (!budget) {
    throw new AppError('Budget not found', 404, 'BUDGET_NOT_FOUND');
  }

  return { message: 'Budget deleted successfully' };
};

/**
 * Get comprehensive budget summary
 */
export const getBudgetSummary = async (userId) => {
  const userObjectId = new mongoose.Types.ObjectId(userId.toString());

  // Fetch all active budgets
  const activeBudgets = await Budget.find({
    user: userObjectId,
    isActive: true,
  }).populate('category', 'name type icon color isSystem');

  // Compute live progress for each active budget
  const budgetsWithProgress = await Promise.all(
    activeBudgets.map(async (b) => {
      const progress = await calculateBudgetProgress(b, userId);
      return {
        ...b.toJSON(),
        progress,
      };
    })
  );

  let totalBudgetedAmount = 0;
  let totalSpendingAcrossBudgets = 0;
  let totalRemainingAmount = 0;
  let budgetsApproachingThreshold = 0;
  let budgetsExceeded = 0;

  for (const b of budgetsWithProgress) {
    totalBudgetedAmount += b.progress.budgetAmount;
    totalSpendingAcrossBudgets += b.progress.spentAmount;
    totalRemainingAmount += b.progress.remainingAmount;

    if (b.progress.exceededBudget) {
      budgetsExceeded++;
    } else if (b.progress.thresholdReached) {
      budgetsApproachingThreshold++;
    }
  }

  // Calculate actual total expenses for the current calendar month to avoid double counting
  const monthRange = getMonthRange();
  const actualExpensesAgg = await Transaction.aggregate([
    {
      $match: {
        user: userObjectId,
        type: 'EXPENSE',
        transactionDate: {
          $gte: monthRange.startDate,
          $lte: monthRange.endDate,
        },
      },
    },
    {
      $group: {
        _id: null,
        total: { $sum: '$amount' },
      },
    },
  ]);

  const totalActualExpenses = actualExpensesAgg.length > 0
    ? Math.round(parseFloat(actualExpensesAgg[0].total?.toString() || '0') * 100) / 100
    : 0;

  return {
    summary: {
      totalActiveBudgets: activeBudgets.length,
      totalBudgetedAmount: Math.round(totalBudgetedAmount * 100) / 100,
      totalSpendingAcrossBudgets: Math.round(totalSpendingAcrossBudgets * 100) / 100,
      totalRemainingAmount: Math.round(totalRemainingAmount * 100) / 100,
      totalActualExpenses,
      budgetsApproachingThreshold,
      budgetsExceeded,
    },
    budgets: budgetsWithProgress,
  };
};

