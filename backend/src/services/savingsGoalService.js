import mongoose from 'mongoose';
import SavingsGoal from '../models/SavingsGoal.js';
import SavingsContribution from '../models/SavingsContribution.js';
import Transaction from '../models/Transaction.js';
import { AppError } from '../utils/AppError.js';

/**
 * Calculate dynamic progress from contributions for a given savings goal
 */
export const calculateGoalProgress = async (goal, userId) => {
  const goalId = goal._id || goal.id;
  const userObjectId = new mongoose.Types.ObjectId(userId.toString());

  const agg = await SavingsContribution.aggregate([
    {
      $match: {
        savingsGoal: new mongoose.Types.ObjectId(goalId.toString()),
        user: userObjectId,
      },
    },
    {
      $group: {
        _id: null,
        total: { $sum: '$amount' },
        count: { $sum: 1 },
      },
    },
  ]);

  const targetAmount = parseFloat(goal.targetAmount?.toString() || '0');
  const currentSavedAmount = agg.length > 0 ? parseFloat(agg[0].total?.toString() || '0') : 0;
  const contributionsCount = agg.length > 0 ? agg[0].count : 0;

  const roundedSaved = Math.round(currentSavedAmount * 100) / 100;
  const remainingAmount = Math.max(0, Math.round((targetAmount - roundedSaved) * 100) / 100);

  // Uncapped percentage
  const percentageCompleted = targetAmount > 0
    ? Math.round((roundedSaved / targetAmount) * 10000) / 100
    : 0;

  const isExceeded = roundedSaved > targetAmount;
  const isTargetReached = roundedSaved >= targetAmount;

  let daysRemaining = null;
  if (goal.targetDate) {
    const msRemaining = new Date(goal.targetDate).getTime() - Date.now();
    daysRemaining = Math.max(0, Math.ceil(msRemaining / (1000 * 60 * 60 * 24)));
  }

  return {
    targetAmount,
    currentSavedAmount: roundedSaved,
    savedAmount: roundedSaved,
    remainingAmount,
    percentageCompleted,
    percentage: percentageCompleted,
    isExceeded,
    isTargetReached,
    contributionsCount,
    daysRemaining,
    status: goal.status,
    currency: goal.currency,
  };
};

/**
 * Create a new savings goal
 */
export const createSavingsGoal = async (userId, data) => {
  const goal = await SavingsGoal.create({
    user: userId,
    name: data.name?.trim ? data.name.trim() : data.name,
    description: data.description?.trim ? data.description.trim() : (data.description || null),
    targetAmount: data.targetAmount,
    currency: (data.currency || 'INR').toUpperCase(),
    targetDate: data.targetDate ? new Date(data.targetDate) : null,
    status: (data.status || 'ACTIVE').toUpperCase(),
    category: data.category?.trim ? data.category.trim() : (data.category || 'General'),
    icon: data.icon?.trim ? data.icon.trim() : (data.icon || 'piggy-bank'),
    color: data.color?.trim ? data.color.trim() : (data.color || '#10b981'),
  });

  const progress = await calculateGoalProgress(goal, userId);

  return {
    ...goal.toJSON(),
    progress,
  };
};

/**
 * List all savings goals for the user with live calculated progress
 */
export const getSavingsGoals = async (userId, query = {}) => {
  const page = Math.max(1, parseInt(query.page, 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(query.limit, 10) || 20));
  const skip = (page - 1) * limit;

  const filter = {
    user: new mongoose.Types.ObjectId(userId.toString()),
  };

  if (query.status) {
    filter.status = query.status.toUpperCase();
  }

  if (query.category) {
    filter.category = query.category;
  }

  if (query.search && query.search.trim()) {
    filter.name = { $regex: query.search.trim(), $options: 'i' };
  }

  const [goals, total] = await Promise.all([
    SavingsGoal.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    SavingsGoal.countDocuments(filter),
  ]);

  const goalsWithProgress = await Promise.all(
    goals.map(async (g) => {
      const progress = await calculateGoalProgress(g, userId);
      return {
        ...g.toJSON(),
        progress,
      };
    })
  );

  return {
    goals: goalsWithProgress,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
    },
  };
};

/**
 * Get savings goal by ID
 */
export const getSavingsGoalById = async (goalId, userId) => {
  if (!mongoose.Types.ObjectId.isValid(goalId)) {
    throw new AppError('Invalid savings goal ID format', 400);
  }

  const goal = await SavingsGoal.findOne({
    _id: goalId,
    user: userId,
  });

  if (!goal) {
    throw new AppError('Savings goal not found', 404, 'SAVINGS_GOAL_NOT_FOUND');
  }

  const progress = await calculateGoalProgress(goal, userId);

  return {
    ...goal.toJSON(),
    progress,
  };
};

/**
 * Update savings goal details
 */
export const updateSavingsGoal = async (goalId, userId, updateData) => {
  if (!mongoose.Types.ObjectId.isValid(goalId)) {
    throw new AppError('Invalid savings goal ID format', 400);
  }

  const goal = await SavingsGoal.findOne({
    _id: goalId,
    user: userId,
  });

  if (!goal) {
    throw new AppError('Savings goal not found', 404, 'SAVINGS_GOAL_NOT_FOUND');
  }

  if (updateData.name) goal.name = updateData.name.trim();
  if (updateData.description !== undefined) goal.description = updateData.description?.trim() || null;
  if (updateData.targetAmount !== undefined) {
    goal.targetAmount = mongoose.Types.Decimal128.fromString(Number(updateData.targetAmount).toFixed(2));
  }
  if (updateData.currency) goal.currency = updateData.currency.toUpperCase();
  if (updateData.targetDate !== undefined) {
    goal.targetDate = updateData.targetDate ? new Date(updateData.targetDate) : null;
  }
  if (updateData.status) goal.status = updateData.status.toUpperCase();
  if (updateData.category) goal.category = updateData.category.trim();
  if (updateData.icon) goal.icon = updateData.icon.trim();
  if (updateData.color) goal.color = updateData.color.trim();

  await goal.save();
  const progress = await calculateGoalProgress(goal, userId);

  return {
    ...goal.toJSON(),
    progress,
  };
};

/**
 * Update savings goal status
 */
export const updateGoalStatus = async (goalId, userId, status) => {
  if (!mongoose.Types.ObjectId.isValid(goalId)) {
    throw new AppError('Invalid savings goal ID', 400);
  }

  const goal = await SavingsGoal.findOne({
    _id: goalId,
    user: userId,
  });

  if (!goal) {
    throw new AppError('Savings goal not found', 404, 'SAVINGS_GOAL_NOT_FOUND');
  }

  goal.status = status.toUpperCase();
  await goal.save();

  const progress = await calculateGoalProgress(goal, userId);

  return {
    ...goal.toJSON(),
    progress,
  };
};

/**
 * Get savings summary and aggregate metrics for a user
 */
export const getSavingsSummary = async (userId) => {
  const userObjectId = new mongoose.Types.ObjectId(userId.toString());
  const goals = await SavingsGoal.find({ user: userObjectId });

  let totalSaved = 0;
  let totalTarget = 0;
  let activeGoalsCount = 0;
  let completedGoalsCount = 0;

  for (const g of goals) {
    const progress = await calculateGoalProgress(g, userId);
    totalSaved += progress.savedAmount;
    totalTarget += progress.targetAmount;
    if (g.status === 'ACTIVE') activeGoalsCount++;
    if (g.status === 'COMPLETED') completedGoalsCount++;
  }

  totalSaved = Math.round(totalSaved * 100) / 100;
  totalTarget = Math.round(totalTarget * 100) / 100;
  const overallPercentage = totalTarget > 0 ? Math.round((totalSaved / totalTarget) * 10000) / 100 : 0;

  return {
    totalGoals: goals.length,
    activeGoals: activeGoalsCount,
    completedGoals: completedGoalsCount,
    totalSaved,
    totalTarget,
    remainingAmount: Math.max(0, Math.round((totalTarget - totalSaved) * 100) / 100),
    overallPercentage,
  };
};

/**
 * Delete savings goal and its associated contributions
 */
export const deleteSavingsGoal = async (goalId, userId) => {
  if (!mongoose.Types.ObjectId.isValid(goalId)) {
    throw new AppError('Invalid savings goal ID format', 400);
  }

  const goal = await SavingsGoal.findOneAndDelete({
    _id: goalId,
    user: userId,
  });

  if (!goal) {
    throw new AppError('Savings goal not found', 404, 'SAVINGS_GOAL_NOT_FOUND');
  }

  // Delete all associated contributions
  await SavingsContribution.deleteMany({ savingsGoal: goalId });

  return { message: 'Savings goal and associated contributions deleted successfully' };
};

/**
 * Add a contribution toward a savings goal
 */
export const addContribution = async (goalId, userId, data) => {
  const goal = await SavingsGoal.findOne({
    _id: goalId,
    user: userId,
  });

  if (!goal) {
    throw new AppError('Savings goal not found', 404, 'SAVINGS_GOAL_NOT_FOUND');
  }

  if (goal.status === 'CANCELLED' || goal.status === 'PAUSED') {
    throw new AppError(
      `Cannot add contribution to a ${goal.status.toLowerCase()} savings goal. Please resume the goal first.`,
      400,
      'GOAL_NOT_ACTIVE'
    );
  }

  // If transactionId is provided, verify it belongs to user
  if (data.transactionId) {
    const tx = await Transaction.findOne({ _id: data.transactionId, user: userId });
    if (!tx) {
      throw new AppError('Referenced transaction not found or unauthorized', 404, 'TRANSACTION_NOT_FOUND');
    }
  }

  const contribution = await SavingsContribution.create({
    user: userId,
    savingsGoal: goalId,
    amount: data.amount,
    currency: goal.currency,
    contributionDate: data.contributionDate ? new Date(data.contributionDate) : new Date(),
    source: (data.source || 'MANUAL').toUpperCase(),
    transactionId: data.transactionId || null,
    description: data.description?.trim() || '',
    notes: data.notes?.trim() || null,
  });

  // Check if goal reached target
  const updatedProgress = await calculateGoalProgress(goal, userId);
  if (updatedProgress.isTargetReached && goal.status === 'ACTIVE') {
    goal.status = 'COMPLETED';
    await goal.save();
    updatedProgress.status = 'COMPLETED';
  }

  return {
    ...contribution.toJSON(),
    contribution: contribution.toJSON(),
    goalProgress: updatedProgress,
  };
};

/**
 * Get contributions for a goal
 */
export const getContributions = async (goalId, userId, query = {}) => {
  const goal = await SavingsGoal.findOne({
    _id: goalId,
    user: userId,
  });

  if (!goal) {
    throw new AppError('Savings goal not found', 404, 'SAVINGS_GOAL_NOT_FOUND');
  }

  const page = Math.max(1, parseInt(query.page, 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(query.limit, 10) || 20));
  const skip = (page - 1) * limit;

  const [contributions, total] = await Promise.all([
    SavingsContribution.find({ savingsGoal: goalId, user: userId })
      .sort({ contributionDate: -1, createdAt: -1 })
      .skip(skip)
      .limit(limit),
    SavingsContribution.countDocuments({ savingsGoal: goalId, user: userId }),
  ]);

  const progress = await calculateGoalProgress(goal, userId);

  return {
    contributions,
    goalProgress: progress,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
    },
  };
};

/**
 * Update an existing contribution
 */
export const updateContribution = async (goalId, contributionId, userId, updateData) => {
  const contribution = await SavingsContribution.findOne({
    _id: contributionId,
    savingsGoal: goalId,
    user: userId,
  });

  if (!contribution) {
    throw new AppError('Savings contribution not found', 404, 'CONTRIBUTION_NOT_FOUND');
  }

  if (updateData.amount !== undefined) {
    contribution.amount = mongoose.Types.Decimal128.fromString(Number(updateData.amount).toFixed(2));
  }
  if (updateData.contributionDate) {
    contribution.contributionDate = new Date(updateData.contributionDate);
  }
  if (updateData.description !== undefined) {
    contribution.description = updateData.description.trim();
  }
  if (updateData.notes !== undefined) {
    contribution.notes = updateData.notes?.trim() || null;
  }

  await contribution.save();

  const goal = await SavingsGoal.findById(goalId);
  const progress = await calculateGoalProgress(goal, userId);

  return {
    contribution: contribution.toJSON(),
    goalProgress: progress,
  };
};

/**
 * Delete a contribution
 */
export const deleteContribution = async (goalId, contributionId, userId) => {
  const contribution = await SavingsContribution.findOneAndDelete({
    _id: contributionId,
    savingsGoal: goalId,
    user: userId,
  });

  if (!contribution) {
    throw new AppError('Savings contribution not found', 404, 'CONTRIBUTION_NOT_FOUND');
  }

  const goal = await SavingsGoal.findById(goalId);
  const progress = await calculateGoalProgress(goal, userId);

  return {
    message: 'Contribution deleted successfully',
    goalProgress: progress,
  };
};

