import { Router } from 'express';
import { authenticate } from '../middleware/authMiddleware.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { sendSuccess } from '../utils/apiResponse.js';

const router = Router();
router.use(authenticate);

router.get('/finance', asyncHandler(async (req, res) => {
  sendSuccess(res, {
    message: 'Finance analytics endpoint ready. Implementation in Phase 3.',
    data: {
      totalIncome: 0,
      totalExpenses: 0,
      savings: 0,
      savingsRate: 0,
      categoryBreakdown: [],
      monthlyTrend: [],
    },
  });
}));

router.get('/nutrition', asyncHandler(async (req, res) => {
  sendSuccess(res, {
    message: 'Nutrition analytics endpoint ready. Implementation in Phase 5.',
    data: { weeklyCalories: [], macroDistribution: {} },
  });
}));

router.get('/sugar', asyncHandler(async (req, res) => {
  sendSuccess(res, {
    message: 'Sugar analytics endpoint ready. Implementation in Phase 5.',
    data: { weeklyTrend: [], foodBreakdown: [] },
  });
}));

router.get('/dashboard', asyncHandler(async (req, res) => {
  sendSuccess(res, {
    message: 'Dashboard analytics endpoint ready.',
    data: {
      finance: { totalIncome: 0, totalExpenses: 0, budget: null },
      nutrition: { todayCalories: 0, todayWater: 0 },
      fitness: { weeklyActivity: [] },
    },
  });
}));

export default router;

