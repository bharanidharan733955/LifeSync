import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import mongoose from 'mongoose';
import app from '../src/app.js';
import User from '../src/models/User.js';
import FinanceCategory from '../src/models/FinanceCategory.js';
import Transaction from '../src/models/Transaction.js';
import Budget from '../src/models/Budget.js';

describe('Phase 3B: Budget Management Integration Tests', () => {
  let userTokenA;
  let userTokenB;
  let userIdA;
  let userIdB;
  let foodCatId;
  let transportCatId;
  let userACustomCatId;
  let createdCategoryBudgetId;
  let createdOverallBudgetId;

  // Use current month dates so budget is active and unexpired
  const now = new Date();
  const startOfMonth = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1, 0, 0, 0, 0)).toISOString();
  const endOfMonth = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 0, 23, 59, 59, 999)).toISOString();

  const midMonth1 = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 5, 10, 0, 0, 0)).toISOString();
  const midMonth2 = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 10, 11, 0, 0, 0)).toISOString();
  const midMonth3 = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 15, 12, 0, 0, 0)).toISOString();
  const midMonth4 = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 20, 18, 0, 0, 0)).toISOString();

  const pastDate = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 1, 15, 12, 0, 0, 0)).toISOString();
  const futureDate = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 2, 15, 12, 0, 0, 0)).toISOString();

  beforeAll(async () => {
    await User.deleteMany({});
    await FinanceCategory.deleteMany({});
    await Transaction.deleteMany({});
    await Budget.deleteMany({});

    // Register User A
    const resA = await request(app)
      .post('/api/v1/auth/register')
      .send({
        fullName: 'Budget User A',
        email: 'budget_a@lifetrack.test',
        password: 'Password123!',
      });
    userTokenA = resA.body.data.accessToken;
    userIdA = resA.body.data.user.id || resA.body.data.user._id;

    // Register User B
    const resB = await request(app)
      .post('/api/v1/auth/register')
      .send({
        fullName: 'Budget User B',
        email: 'budget_b@lifetrack.test',
        password: 'Password123!',
      });
    userTokenB = resB.body.data.accessToken;
    userIdB = resB.body.data.user.id || resB.body.data.user._id;

    // Seed/Fetch categories
    const catRes = await request(app)
      .get('/api/v1/categories')
      .set('Authorization', `Bearer ${userTokenA}`);

    const foodCat = catRes.body.data.find((c) => c.name === 'Food');
    const transCat = catRes.body.data.find((c) => c.name === 'Transport');
    foodCatId = foodCat._id;
    transportCatId = transCat._id;

    // Create a custom category for User A
    const customRes = await request(app)
      .post('/api/v1/categories')
      .set('Authorization', `Bearer ${userTokenA}`)
      .send({
        name: 'Fine Dining & Wine',
        type: 'EXPENSE',
      });
    userACustomCatId = customRes.body.data._id;
  });

  // ─── 1. Budget CRUD & Validation ─────────────────────────────────────────────
  it('1. POST /api/v1/budgets - should create a CATEGORY budget successfully', async () => {
    const res = await request(app)
      .post('/api/v1/budgets')
      .set('Authorization', `Bearer ${userTokenA}`)
      .send({
        name: 'Monthly Food Budget',
        budgetType: 'CATEGORY',
        category: foodCatId,
        amount: 5000,
        currency: 'INR',
        period: 'CUSTOM',
        startDate: startOfMonth,
        endDate: endOfMonth,
        alertThreshold: 75,
        notes: 'Monthly dining and groceries allocation',
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    createdCategoryBudgetId = res.body.data._id || res.body.data.id;

    expect(res.body.data.name).toBe('Monthly Food Budget');
    expect(res.body.data.budgetType).toBe('CATEGORY');
    expect(res.body.data.amount).toBe(5000);
    expect(res.body.data.alertThreshold).toBe(75);
    expect(res.body.data.category.name).toBe('Food');
    expect(res.body.data.progress).toBeDefined();
    expect(res.body.data.progress.budgetAmount).toBe(5000);
    expect(res.body.data.progress.spentAmount).toBe(0);
    expect(res.body.data.progress.remainingAmount).toBe(5000);
    expect(res.body.data.progress.percentageUsed).toBe(0);
    expect(res.body.data.progress.status).toBe('NORMAL');
  });

  it('2. POST /api/v1/budgets - should create an OVERALL budget successfully without category', async () => {
    const res = await request(app)
      .post('/api/v1/budgets')
      .set('Authorization', `Bearer ${userTokenA}`)
      .send({
        name: 'Total Monthly Spending Limit',
        budgetType: 'OVERALL',
        amount: 25000,
        currency: 'INR',
        period: 'CUSTOM',
        startDate: startOfMonth,
        endDate: endOfMonth,
        alertThreshold: 80,
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    createdOverallBudgetId = res.body.data._id || res.body.data.id;

    expect(res.body.data.budgetType).toBe('OVERALL');
    expect(res.body.data.category).toBeNull();
    expect(res.body.data.amount).toBe(25000);
  });

  it('3. POST /api/v1/budgets - should reject CATEGORY budget missing category (422)', async () => {
    const res = await request(app)
      .post('/api/v1/budgets')
      .set('Authorization', `Bearer ${userTokenA}`)
      .send({
        name: 'Invalid Category Budget',
        budgetType: 'CATEGORY',
        amount: 1000,
        period: 'CUSTOM',
        startDate: startOfMonth,
        endDate: endOfMonth,
      });

    expect(res.status).toBe(422);
    expect(res.body.success).toBe(false);
  });

  it('4. POST /api/v1/budgets - should reject non-positive amounts (422)', async () => {
    const resZero = await request(app)
      .post('/api/v1/budgets')
      .set('Authorization', `Bearer ${userTokenA}`)
      .send({
        name: 'Zero Budget',
        budgetType: 'OVERALL',
        amount: 0,
        period: 'CUSTOM',
        startDate: startOfMonth,
        endDate: endOfMonth,
      });
    expect(resZero.status).toBe(422);

    const resNeg = await request(app)
      .post('/api/v1/budgets')
      .set('Authorization', `Bearer ${userTokenA}`)
      .send({
        name: 'Negative Budget',
        budgetType: 'OVERALL',
        amount: -500,
        period: 'CUSTOM',
        startDate: startOfMonth,
        endDate: endOfMonth,
      });
    expect(resNeg.status).toBe(422);
  });

  it('5. POST /api/v1/budgets - should reject invalid alert threshold (422)', async () => {
    const resAbove = await request(app)
      .post('/api/v1/budgets')
      .set('Authorization', `Bearer ${userTokenA}`)
      .send({
        name: 'Threshold 150',
        budgetType: 'OVERALL',
        amount: 5000,
        period: 'CUSTOM',
        startDate: startOfMonth,
        endDate: endOfMonth,
        alertThreshold: 150,
      });
    expect(resAbove.status).toBe(422);

    const resBelow = await request(app)
      .post('/api/v1/budgets')
      .set('Authorization', `Bearer ${userTokenA}`)
      .send({
        name: 'Threshold 0',
        budgetType: 'OVERALL',
        amount: 5000,
        period: 'CUSTOM',
        startDate: startOfMonth,
        endDate: endOfMonth,
        alertThreshold: 0,
      });
    expect(resBelow.status).toBe(422);
  });

  it('6. POST /api/v1/budgets - should reject startDate after or equal to endDate (422)', async () => {
    const res = await request(app)
      .post('/api/v1/budgets')
      .set('Authorization', `Bearer ${userTokenA}`)
      .send({
        name: 'Inverted Dates',
        budgetType: 'OVERALL',
        amount: 5000,
        period: 'CUSTOM',
        startDate: endOfMonth,
        endDate: startOfMonth,
      });

    expect(res.status).toBe(422);
  });

  // ─── 2. Budget Calculations & Spending Aggregation ───────────────────────────
  it('7. Budget Calculation: Expense transactions update spentAmount and remainingAmount', async () => {
    // Add an expense of ₹2,000 for Food inside current month
    await request(app)
      .post('/api/v1/transactions')
      .set('Authorization', `Bearer ${userTokenA}`)
      .send({
        title: 'Weekly Groceries',
        type: 'EXPENSE',
        amount: 2000,
        currency: 'INR',
        category: foodCatId,
        paymentMethod: 'UPI',
        transactionDate: midMonth1,
      });

    // Check progress for the Food category budget
    const res = await request(app)
      .get(`/api/v1/budgets/${createdCategoryBudgetId}`)
      .set('Authorization', `Bearer ${userTokenA}`);

    expect(res.status).toBe(200);
    const p = res.body.data.progress;
    expect(p.budgetAmount).toBe(5000);
    expect(p.spentAmount).toBe(2000);
    expect(p.remainingAmount).toBe(3000);
    expect(p.percentageUsed).toBe(40);
    expect(p.percentageRemaining).toBe(60);
    expect(p.thresholdReached).toBe(false);
    expect(p.exceededBudget).toBe(false);
    expect(p.status).toBe('NORMAL');
    expect(p.transactionCount).toBe(1);
  });

  it('8. Budget Calculation: INCOME transactions must strictly NEVER count toward spending', async () => {
    // Add an income transaction of ₹50,000 in Food category
    await request(app)
      .post('/api/v1/transactions')
      .set('Authorization', `Bearer ${userTokenA}`)
      .send({
        title: 'Cashback Refund',
        type: 'INCOME',
        amount: 50000,
        currency: 'INR',
        category: foodCatId,
        paymentMethod: 'UPI',
        transactionDate: midMonth2,
      });

    // Verify Food budget spentAmount is still exactly 2000, NOT reduced or increased
    const res = await request(app)
      .get(`/api/v1/budgets/${createdCategoryBudgetId}`)
      .set('Authorization', `Bearer ${userTokenA}`);

    expect(res.body.data.progress.spentAmount).toBe(2000);
    expect(res.body.data.progress.transactionCount).toBe(1);
  });

  it('9. Budget Calculation: Category isolation (other categories do not count toward category budget)', async () => {
    // Add an expense of ₹1,500 in Transport category
    await request(app)
      .post('/api/v1/transactions')
      .set('Authorization', `Bearer ${userTokenA}`)
      .send({
        title: 'Fuel refuel',
        type: 'EXPENSE',
        amount: 1500,
        currency: 'INR',
        category: transportCatId,
        paymentMethod: 'DEBIT_CARD',
        transactionDate: midMonth2,
      });

    // Food category budget should still only show ₹2,000 spent
    const foodRes = await request(app)
      .get(`/api/v1/budgets/${createdCategoryBudgetId}`)
      .set('Authorization', `Bearer ${userTokenA}`);
    expect(foodRes.body.data.progress.spentAmount).toBe(2000);

    // BUT the OVERALL budget (₹25,000 limit) should include BOTH Food (2000) and Transport (1500) = ₹3,500
    const overallRes = await request(app)
      .get(`/api/v1/budgets/${createdOverallBudgetId}`)
      .set('Authorization', `Bearer ${userTokenA}`);
    expect(overallRes.body.data.progress.spentAmount).toBe(3500);
    expect(overallRes.body.data.progress.transactionCount).toBe(2);
  });

  it('10. Budget Calculation: Date boundary filtering (expenses outside budget window are ignored)', async () => {
    // Add an expense of ₹3,000 before budget start
    await request(app)
      .post('/api/v1/transactions')
      .set('Authorization', `Bearer ${userTokenA}`)
      .send({
        title: 'Old Dinner',
        type: 'EXPENSE',
        amount: 3000,
        currency: 'INR',
        category: foodCatId,
        paymentMethod: 'CASH',
        transactionDate: pastDate,
      });

    // Add an expense of ₹4,000 after budget end
    await request(app)
      .post('/api/v1/transactions')
      .set('Authorization', `Bearer ${userTokenA}`)
      .send({
        title: 'Future Dinner',
        type: 'EXPENSE',
        amount: 4000,
        currency: 'INR',
        category: foodCatId,
        paymentMethod: 'CASH',
        transactionDate: futureDate,
      });

    // Food budget should still strictly show ₹2,000 spent
    const res = await request(app)
      .get(`/api/v1/budgets/${createdCategoryBudgetId}`)
      .set('Authorization', `Bearer ${userTokenA}`);
    expect(res.body.data.progress.spentAmount).toBe(2000);
  });

  it('11. Threshold Warning Detection: Triggers WARNING state when spent >= alertThreshold', async () => {
    // Food budget limit: ₹5,000. alertThreshold: 75% (= ₹3,750).
    // Currently spent: ₹2,000. Adding ₹1,800 brings total spent to ₹3,800 (76%).
    await request(app)
      .post('/api/v1/transactions')
      .set('Authorization', `Bearer ${userTokenA}`)
      .send({
        title: 'Weekend Fine Dining',
        type: 'EXPENSE',
        amount: 1800,
        currency: 'INR',
        category: foodCatId,
        paymentMethod: 'CREDIT_CARD',
        transactionDate: midMonth3,
      });

    const res = await request(app)
      .get(`/api/v1/budgets/${createdCategoryBudgetId}`)
      .set('Authorization', `Bearer ${userTokenA}`);

    const p = res.body.data.progress;
    expect(p.spentAmount).toBe(3800);
    expect(p.percentageUsed).toBe(76);
    expect(p.thresholdReached).toBe(true);
    expect(p.exceededBudget).toBe(false);
    expect(p.status).toBe('WARNING');
  });

  it('12. Budget Exceeded Detection: Triggers EXCEEDED state & negative remaining balance', async () => {
    // Food budget limit: ₹5,000. Currently spent: ₹3,800.
    // Adding ₹1,500 brings total to ₹5,300 (106%).
    await request(app)
      .post('/api/v1/transactions')
      .set('Authorization', `Bearer ${userTokenA}`)
      .send({
        title: 'Lavish Gourmet Feast',
        type: 'EXPENSE',
        amount: 1500,
        currency: 'INR',
        category: foodCatId,
        paymentMethod: 'UPI',
        transactionDate: midMonth4,
      });

    const res = await request(app)
      .get(`/api/v1/budgets/${createdCategoryBudgetId}`)
      .set('Authorization', `Bearer ${userTokenA}`);

    const p = res.body.data.progress;
    expect(p.spentAmount).toBe(5300);
    expect(p.remainingAmount).toBe(-300); // Negative remaining balance allowed
    expect(p.percentageUsed).toBe(106); // Not capped at 100%
    expect(p.percentageRemaining).toBe(0);
    expect(p.thresholdReached).toBe(true);
    expect(p.exceededBudget).toBe(true);
    expect(p.status).toBe('EXCEEDED');
  });

  // ─── 3. Detailed Progress and Summary Endpoints ──────────────────────────────
  it('13. GET /api/v1/budgets/:id/progress - should return qualifying transactions', async () => {
    const res = await request(app)
      .get(`/api/v1/budgets/${createdCategoryBudgetId}/progress`)
      .set('Authorization', `Bearer ${userTokenA}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.progress.spentAmount).toBe(5300);
    expect(Array.isArray(res.body.data.transactions)).toBe(true);
    expect(res.body.data.transactions.length).toBe(3); // 2000 + 1800 + 1500
  });

  it('14. GET /api/v1/budgets/summary - should return aggregated active budget stats', async () => {
    const res = await request(app)
      .get('/api/v1/budgets/summary')
      .set('Authorization', `Bearer ${userTokenA}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    const s = res.body.data.summary;
    expect(s.totalActiveBudgets).toBe(2);
    expect(s.totalBudgetedAmount).toBe(30000); // 5000 + 25000
    expect(s.budgetsExceeded).toBe(1); // Food budget exceeded
    expect(Array.isArray(res.body.data.budgets)).toBe(true);
  });

  // ─── 4. Update, Delete & Transaction Safety ──────────────────────────────────
  it('15. PUT /api/v1/budgets/:id - should update budget limit and threshold', async () => {
    const res = await request(app)
      .put(`/api/v1/budgets/${createdCategoryBudgetId}`)
      .set('Authorization', `Bearer ${userTokenA}`)
      .send({
        amount: 8000, // Increase budget from 5000 to 8000
        alertThreshold: 85,
        name: 'Expanded Food Budget',
      });

    expect(res.status).toBe(200);
    expect(res.body.data.amount).toBe(8000);
    expect(res.body.data.name).toBe('Expanded Food Budget');

    // With 5300 spent against 8000 (66.25%), status should return to NORMAL
    const p = res.body.data.progress;
    expect(p.budgetAmount).toBe(8000);
    expect(p.spentAmount).toBe(5300);
    expect(p.remainingAmount).toBe(2700);
    expect(p.percentageUsed).toBe(66.25);
    expect(p.exceededBudget).toBe(false);
    expect(p.thresholdReached).toBe(false);
    expect(p.status).toBe('NORMAL');
  });

  it('16. DELETE /api/v1/budgets/:id - deletes budget without deleting transactions', async () => {
    // Delete the Food budget
    const delRes = await request(app)
      .delete(`/api/v1/budgets/${createdCategoryBudgetId}`)
      .set('Authorization', `Bearer ${userTokenA}`);

    expect(delRes.status).toBe(200);
    expect(delRes.body.success).toBe(true);

    // Verify budget is gone
    const getRes = await request(app)
      .get(`/api/v1/budgets/${createdCategoryBudgetId}`)
      .set('Authorization', `Bearer ${userTokenA}`);
    expect(getRes.status).toBe(404);

    // Verify all transactions in User A still exist intact!
    const txRes = await request(app)
      .get('/api/v1/transactions')
      .set('Authorization', `Bearer ${userTokenA}`);
    expect(txRes.body.data.length).toBeGreaterThanOrEqual(4);
  });

  // ─── 5. Security & Cross-User Isolation ──────────────────────────────────────
  it('17. Security: User B cannot access, update, or delete User A budgets (IDOR prevention)', async () => {
    // User B tries to view User A's overall budget
    const getRes = await request(app)
      .get(`/api/v1/budgets/${createdOverallBudgetId}`)
      .set('Authorization', `Bearer ${userTokenB}`);
    expect(getRes.status).toBe(404);

    // User B tries to update User A's budget
    const updateRes = await request(app)
      .put(`/api/v1/budgets/${createdOverallBudgetId}`)
      .set('Authorization', `Bearer ${userTokenB}`)
      .send({ amount: 100 });
    expect(updateRes.status).toBe(404);

    // User B tries to delete User A's budget
    const delRes = await request(app)
      .delete(`/api/v1/budgets/${createdOverallBudgetId}`)
      .set('Authorization', `Bearer ${userTokenB}`);
    expect(delRes.status).toBe(404);
  });

  it('18. Security: User B cannot create a budget referencing User A custom category', async () => {
    const res = await request(app)
      .post('/api/v1/budgets')
      .set('Authorization', `Bearer ${userTokenB}`)
      .send({
        name: 'Illicit Category Budget',
        budgetType: 'CATEGORY',
        category: userACustomCatId, // Category owned by User A
        amount: 5000,
        period: 'CUSTOM',
        startDate: startOfMonth,
        endDate: endOfMonth,
      });

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });

  it('19. Verify /api/v1/finance/budgets alias works identically', async () => {
    const res = await request(app)
      .get('/api/v1/finance/budgets')
      .set('Authorization', `Bearer ${userTokenA}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });
});
