import mongoose from 'mongoose';
import RecurringTransaction from '../models/RecurringTransaction.js';
import Transaction from '../models/Transaction.js';
import FinanceCategory from '../models/FinanceCategory.js';
import { computeNextOccurrence } from '../utils/recurrenceUtils.js';
import { AppError } from '../utils/AppError.js';

/**
 * Validate category exists and belongs to user or is system
 */
const validateCategory = async (categoryId, userId) => {
  if (!categoryId) return null;
  const category = await FinanceCategory.findOne({
    _id: categoryId,
    $or: [{ isSystem: true }, { user: userId }],
  });
  if (!category) {
    throw new AppError('Category not found or does not belong to you', 400);
  }
  return category;
};

/**
 * Create a new recurring transaction schedule
 */
export const createRecurringTransaction = async (data, userId) => {
  const {
    type,
    title,
    description,
    amount,
    currency,
    category,
    paymentMethod,
    frequency,
    interval = 1,
    startDate,
    endDate,
    notes,
  } = data;

  await validateCategory(category, userId);

  const start = new Date(startDate);
  let end = endDate ? new Date(endDate) : null;
  if (end && end <= start) {
    throw new AppError('endDate must be strictly after startDate', 400);
  }

  // Initial nextOccurrence is the startDate
  const nextOccurrence = new Date(start);

  const recurring = await RecurringTransaction.create({
    user: userId,
    type,
    title,
    description,
    amount,
    currency: currency ? currency.toUpperCase() : 'USD',
    category,
    paymentMethod,
    frequency,
    interval,
    startDate: start,
    endDate: end,
    nextOccurrence,
    isActive: true,
    notes,
  });

  return recurring.populate('category', 'name icon color type');
};

/**
 * Get all recurring transactions for a user with optional filtering
 */
export const getRecurringTransactions = async (userId, filter = {}) => {
  const query = { user: userId };

  if (filter.type) {
    query.type = filter.type.toUpperCase();
  }
  if (filter.frequency) {
    query.frequency = filter.frequency.toUpperCase();
  }
  if (filter.isActive !== undefined) {
    query.isActive = filter.isActive === 'true' || filter.isActive === true;
  }
  if (filter.category) {
    query.category = filter.category;
  }

  return RecurringTransaction.find(query)
    .populate('category', 'name icon color type')
    .sort({ nextOccurrence: 1, createdAt: -1 });
};

/**
 * Get single recurring transaction by ID
 */
export const getRecurringTransactionById = async (id, userId) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new AppError('Invalid recurring transaction ID format', 400);
  }

  const recurring = await RecurringTransaction.findOne({ _id: id, user: userId })
    .populate('category', 'name icon color type');

  if (!recurring) {
    throw new AppError('Recurring transaction not found', 404);
  }

  return recurring;
};

/**
 * Update recurring transaction
 */
export const updateRecurringTransaction = async (id, data, userId) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new AppError('Invalid recurring transaction ID format', 400);
  }

  const recurring = await RecurringTransaction.findOne({ _id: id, user: userId });
  if (!recurring) {
    throw new AppError('Recurring transaction not found', 404);
  }

  if (data.category) {
    await validateCategory(data.category, userId);
    recurring.category = data.category;
  }

  if (data.type) recurring.type = data.type;
  if (data.title) recurring.title = data.title;
  if (data.description !== undefined) recurring.description = data.description;
  if (data.amount !== undefined) recurring.amount = data.amount;
  if (data.currency) recurring.currency = data.currency.toUpperCase();
  if (data.paymentMethod) recurring.paymentMethod = data.paymentMethod;
  if (data.notes !== undefined) recurring.notes = data.notes;

  let scheduleChanged = false;
  if (data.frequency && data.frequency !== recurring.frequency) {
    recurring.frequency = data.frequency;
    scheduleChanged = true;
  }
  if (data.interval !== undefined && data.interval !== recurring.interval) {
    recurring.interval = data.interval;
    scheduleChanged = true;
  }
  if (data.startDate) {
    recurring.startDate = new Date(data.startDate);
    scheduleChanged = true;
  }
  if (data.endDate !== undefined) {
    recurring.endDate = data.endDate ? new Date(data.endDate) : null;
  }

  if (recurring.endDate && recurring.endDate <= recurring.startDate) {
    throw new AppError('endDate must be strictly after startDate', 400);
  }

  if (scheduleChanged) {
    // If startDate is in future, nextOccurrence becomes startDate
    const now = new Date();
    if (recurring.startDate > now) {
      recurring.nextOccurrence = new Date(recurring.startDate);
    } else {
      // Recompute nextOccurrence from startDate
      let cur = new Date(recurring.startDate);
      while (cur <= now) {
        cur = computeNextOccurrence(cur, recurring.frequency, recurring.interval, recurring.startDate);
      }
      recurring.nextOccurrence = cur;
    }
  }

  if (data.isActive !== undefined) {
    recurring.isActive = Boolean(data.isActive);
  }

  await recurring.save();
  return recurring.populate('category', 'name icon color type');
};

/**
 * Toggle or set active status (pause / resume)
 */
export const toggleRecurringStatus = async (id, userId, isActive) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new AppError('Invalid recurring transaction ID format', 400);
  }

  const recurring = await RecurringTransaction.findOne({ _id: id, user: userId });
  if (!recurring) {
    throw new AppError('Recurring transaction not found', 404);
  }

  recurring.isActive = Boolean(isActive);

  // If resuming and nextOccurrence has lapsed, advance it to the next valid upcoming occurrence
  if (recurring.isActive && recurring.nextOccurrence <= new Date()) {
    let next = new Date(recurring.nextOccurrence);
    const now = new Date();
    while (next <= now) {
      next = computeNextOccurrence(next, recurring.frequency, recurring.interval, recurring.startDate);
    }
    recurring.nextOccurrence = next;

    if (recurring.endDate && recurring.nextOccurrence > recurring.endDate) {
      recurring.isActive = false;
    }
  }

  await recurring.save();
  return recurring.populate('category', 'name icon color type');
};

/**
 * Delete recurring transaction
 */
export const deleteRecurringTransaction = async (id, userId) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new AppError('Invalid recurring transaction ID format', 400);
  }

  const recurring = await RecurringTransaction.findOne({ _id: id, user: userId });
  if (!recurring) {
    throw new AppError('Recurring transaction not found', 404);
  }

  await RecurringTransaction.deleteOne({ _id: id });
  return { message: 'Recurring transaction deleted successfully', id };
};

/**
 * Get generated transactions history for a recurring transaction
 */
export const getRecurringHistory = async (recurringId, userId, query = {}) => {
  if (!mongoose.Types.ObjectId.isValid(recurringId)) {
    throw new AppError('Invalid recurring transaction ID format', 400);
  }

  // Ensure recurring exists and belongs to user
  const recurring = await RecurringTransaction.findOne({ _id: recurringId, user: userId });
  if (!recurring) {
    throw new AppError('Recurring transaction not found', 404);
  }

  const page = Math.max(1, parseInt(query.page, 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(query.limit, 10) || 20));
  const skip = (page - 1) * limit;

  const filter = {
    recurringTransactionId: recurring._id,
    user: userId,
  };

  const [transactions, total] = await Promise.all([
    Transaction.find(filter)
      .populate('category', 'name icon color type')
      .sort({ transactionDate: -1 })
      .skip(skip)
      .limit(limit),
    Transaction.countDocuments(filter),
  ]);

  return {
    recurring,
    transactions,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
};

/**
 * Generate transactions due for execution.
 * Designed to be run by cron or triggered manually/on-demand.
 * Fully idempotent to prevent duplicate generation.
 */
export const generateDueTransactions = async (referenceDate = new Date()) => {
  const refDate = new Date(referenceDate);

  // Find all active recurring transactions whose nextOccurrence is <= refDate
  const dueRecurring = await RecurringTransaction.find({
    isActive: true,
    nextOccurrence: { $lte: refDate },
  });

  const generatedTransactions = [];

  for (const rec of dueRecurring) {
    try {
      const occurrenceDate = new Date(rec.nextOccurrence);

      // Check idempotency: check if transaction already exists for this recurringTransactionId on this occurrence date
      const startOfDay = new Date(occurrenceDate);
      startOfDay.setUTCHours(0, 0, 0, 0);
      const endOfDay = new Date(occurrenceDate);
      endOfDay.setUTCHours(23, 59, 59, 999);

      const existing = await Transaction.findOne({
        recurringTransactionId: rec._id,
        transactionDate: { $gte: startOfDay, $lte: endOfDay },
      });

      if (!existing) {
        // Create transaction
        const tx = await Transaction.create({
          user: rec.user,
          type: rec.type,
          amount: rec.amount,
          currency: rec.currency,
          category: rec.category,
          title: rec.title,
          description: rec.description || `Generated recurring transaction: ${rec.title}`,
          paymentMethod: rec.paymentMethod,
          transactionDate: occurrenceDate,
          recurringTransactionId: rec._id,
          notes: rec.notes,
        });
        generatedTransactions.push(tx);
      }

      // Advance nextOccurrence
      rec.lastGeneratedAt = new Date();
      const nextDate = computeNextOccurrence(rec.nextOccurrence, rec.frequency, rec.interval, rec.startDate);
      rec.nextOccurrence = nextDate;

      // Check if past endDate
      if (rec.endDate && rec.nextOccurrence > rec.endDate) {
        rec.isActive = false;
      }

      await rec.save();
    } catch (err) {
      console.error(`Error processing recurring transaction ${rec._id}:`, err);
    }
  }

  return {
    processedCount: dueRecurring.length,
    generatedCount: generatedTransactions.length,
    transactions: generatedTransactions,
  };
};
