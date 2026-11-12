import * as savingsGoalService from '../services/savingsGoalService.js';
import { sendSuccess } from '../utils/apiResponse.js';

export const getSavingsGoals = async (req, res) => {
  const result = await savingsGoalService.getSavingsGoals(req.userId, req.query);
  sendSuccess(res, {
    message: 'Savings goals retrieved successfully',
    data: result.goals,
    pagination: result.pagination,
  });
};

export const getSavingsSummary = async (req, res) => {
  const result = await savingsGoalService.getSavingsSummary(req.userId);
  sendSuccess(res, {
    message: 'Savings summary retrieved successfully',
    data: result,
  });
};

export const getSavingsGoalById = async (req, res) => {
  const goal = await savingsGoalService.getSavingsGoalById(req.params.id, req.userId);
  sendSuccess(res, {
    message: 'Savings goal retrieved successfully',
    data: goal,
  });
};

export const createSavingsGoal = async (req, res) => {
  const goal = await savingsGoalService.createSavingsGoal(req.userId, req.body);
  sendSuccess(res, {
    status: 201,
    message: 'Savings goal created successfully',
    data: goal,
  });
};

export const updateSavingsGoal = async (req, res) => {
  const goal = await savingsGoalService.updateSavingsGoal(req.params.id, req.userId, req.body);
  sendSuccess(res, {
    message: 'Savings goal updated successfully',
    data: goal,
  });
};

export const updateSavingsGoalStatus = async (req, res) => {
  const goal = await savingsGoalService.updateGoalStatus(req.params.id, req.userId, req.body.status);
  sendSuccess(res, {
    message: `Savings goal status updated to ${req.body.status}`,
    data: goal,
  });
};

export const deleteSavingsGoal = async (req, res) => {
  const result = await savingsGoalService.deleteSavingsGoal(req.params.id, req.userId);
  sendSuccess(res, {
    message: result.message,
    data: result,
  });
};

export const addContribution = async (req, res) => {
  const contribution = await savingsGoalService.addContribution(req.params.id, req.userId, req.body);
  sendSuccess(res, {
    status: 201,
    message: 'Contribution added successfully',
    data: contribution,
  });
};

export const getContributions = async (req, res) => {
  const result = await savingsGoalService.getContributions(req.params.id, req.userId, req.query);
  sendSuccess(res, {
    message: 'Contributions retrieved successfully',
    data: result.contributions,
    goal: result.goal,
    pagination: result.pagination,
  });
};

export const deleteContribution = async (req, res) => {
  const result = await savingsGoalService.deleteContribution(
    req.params.goalId,
    req.params.contributionId,
    req.userId
  );
  sendSuccess(res, {
    message: result.message,
    data: result,
  });
};

