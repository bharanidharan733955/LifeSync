import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import mongoose from 'mongoose';
import app from '../src/app.js';
import User from '../src/models/User.js';
import FinanceCategory from '../src/models/FinanceCategory.js';
import Transaction from '../src/models/Transaction.js';

describe('Phase 3A: Transactions Management Integration Tests', () => {
  let userTokenA;
  let userTokenB;
  let userIdA;
  let userIdB;
  let foodCatId;
  let salaryCatId;
  let createdTxIdA;

  beforeAll(async () => {
    await User.deleteMany({});
    await FinanceCategory.deleteMany({});
    await Transaction.deleteMany({});

    // Register User A
    const resA = await request(app)
      .post('/api/v1/auth/register')
      .send({
        fullName: 'Finance User A',
        email: 'finance_a@lifetrack.test',
        password: 'Password123!',
      });
    userTokenA = resA.body.data.accessToken;
    userIdA = resA.body.data.user.id || resA.body.data.user._id;

    // Register User B
    const resB = await request(app)
      .post('/api/v1/auth/register')
      .send({
        fullName: 'Finance User B',
        email: 'finance_b@lifetrack.test',
        password: 'Password123!',
      });
    userTokenB = resB.body.data.accessToken;
    userIdB = resB.body.data.user.id || resB.body.data.user._id;

    // Seed/Fetch categories
    const catRes = await request(app)
      .get('/api/v1/categories')
      .set('Authorization', `Bearer ${userTokenA}`);

    const foodCat = catRes.body.data.find((c) => c.name === 'Food');
    const salaryCat = catRes.body.data.find((c) => c.name === 'Salary');
    foodCatId = foodCat._id;
    salaryCatId = salaryCat._id;
  });

  it('1. POST /api/v1/transactions - should create an EXPENSE transaction successfully', async () => {
    const res = await request(app)
      .post('/api/v1/transactions')
      .set('Authorization', `Bearer ${userTokenA}`)
      .send({
        type: 'EXPENSE',
        amount: 450.5,
        currency: 'INR',
        category: foodCatId,
        title: 'Team Lunch at Olive Garden',
        description: 'Pasta and drinks with design team',
        merchant: 'Olive Garden',
        paymentMethod: 'UPI',
        transactionDate: '2026-10-15T12:30:00.000Z',
        tags: ['dining', 'team'],
        isFoodExpense: true,
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.title).toBe('Team Lunch at Olive Garden');
    expect(res.body.data.amount).toBe(450.5);
    expect(res.body.data.type).toBe('EXPENSE');
    expect(res.body.data.paymentMethod).toBe('UPI');
    expect(res.body.data.merchant).toBe('Olive Garden');
    expect(res.body.data.user).toBeTruthy();
    expect(res.body.data.category.name).toBe('Food');

    createdTxIdA = res.body.data._id;
  });

  it('2. POST /api/v1/transactions - should create an INCOME transaction successfully', async () => {
    const res = await request(app)
      .post('/api/v1/transactions')
      .set('Authorization', `Bearer ${userTokenA}`)
      .send({
        type: 'INCOME',
        amount: 85000,
        currency: 'INR',
        category: salaryCatId,
        title: 'Monthly Base Salary',
        merchant: 'TechCorp Pvt Ltd',
        paymentMethod: 'BANK_TRANSFER',
        transactionDate: '2026-10-01T09:00:00.000Z',
      });

    expect(res.status).toBe(201);
    expect(res.body.data.type).toBe('INCOME');
    expect(res.body.data.amount).toBe(85000);
    expect(res.body.data.paymentMethod).toBe('BANK_TRANSFER');
  });

  it('3. POST /api/v1/transactions - should reject category type mismatch (e.g., Salary category for EXPENSE)', async () => {
    const res = await request(app)
      .post('/api/v1/transactions')
      .set('Authorization', `Bearer ${userTokenA}`)
      .send({
        type: 'EXPENSE',
        amount: 1000,
        category: salaryCatId, // Salary is INCOME category
        title: 'Invalid Salary Expense',
      });

    expect(res.status).toBe(400);
    expect(res.body.code).toBe('CATEGORY_TYPE_MISMATCH');
  });

  it('4. POST /api/v1/transactions - should reject negative and zero amount', async () => {
    const zeroRes = await request(app)
      .post('/api/v1/transactions')
      .set('Authorization', `Bearer ${userTokenA}`)
      .send({
        type: 'EXPENSE',
        amount: 0,
        category: foodCatId,
        title: 'Zero Amount',
      });
    expect(zeroRes.status).toBe(422);

    const negRes = await request(app)
      .post('/api/v1/transactions')
      .set('Authorization', `Bearer ${userTokenA}`)
      .send({
        type: 'EXPENSE',
        amount: -500,
        category: foodCatId,
        title: 'Negative Amount',
      });
    expect(negRes.status).toBe(422);
  });

  it('5. GET /api/v1/transactions - should return paginated list with total count and summary', async () => {
    const res = await request(app)
      .get('/api/v1/transactions?page=1&limit=10')
      .set('Authorization', `Bearer ${userTokenA}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBe(2);
    expect(res.body.pagination.total).toBe(2);
    expect(res.body.pagination.totalPages).toBe(1);
    expect(res.body.summary.totalIncome).toBe(85000);
    expect(res.body.summary.totalExpenses).toBe(450.5);
    expect(res.body.summary.netBalance).toBe(84549.5);
  });

  it('6. GET /api/v1/transactions - filter by type (INCOME vs EXPENSE)', async () => {
    const incRes = await request(app)
      .get('/api/v1/transactions?type=INCOME')
      .set('Authorization', `Bearer ${userTokenA}`);
    expect(incRes.body.data.length).toBe(1);
    expect(incRes.body.data[0].type).toBe('INCOME');

    const expRes = await request(app)
      .get('/api/v1/transactions?type=EXPENSE')
      .set('Authorization', `Bearer ${userTokenA}`);
    expect(expRes.body.data.length).toBe(1);
    expect(expRes.body.data[0].type).toBe('EXPENSE');
  });

  it('7. GET /api/v1/transactions - filter by paymentMethod', async () => {
    const res = await request(app)
      .get('/api/v1/transactions?paymentMethod=UPI')
      .set('Authorization', `Bearer ${userTokenA}`);

    expect(res.body.data.length).toBe(1);
    expect(res.body.data[0].paymentMethod).toBe('UPI');
  });

  it('8. GET /api/v1/transactions - filter by date range', async () => {
    const res = await request(app)
      .get('/api/v1/transactions?startDate=2026-10-10&endDate=2026-10-20')
      .set('Authorization', `Bearer ${userTokenA}`);

    expect(res.body.data.length).toBe(1);
    expect(res.body.data[0].title).toBe('Team Lunch at Olive Garden');
  });

  it('9. GET /api/v1/transactions - filter by amount range', async () => {
    const res = await request(app)
      .get('/api/v1/transactions?minAmount=1000&maxAmount=100000')
      .set('Authorization', `Bearer ${userTokenA}`);

    expect(res.body.data.length).toBe(1);
    expect(res.body.data[0].amount).toBe(85000);
  });

  it('10. GET /api/v1/transactions - search by merchant and title', async () => {
    const resMerchant = await request(app)
      .get('/api/v1/transactions?search=Olive Garden')
      .set('Authorization', `Bearer ${userTokenA}`);
    expect(resMerchant.body.data.length).toBe(1);

    const resTitle = await request(app)
      .get('/api/v1/transactions?search=Base Salary')
      .set('Authorization', `Bearer ${userTokenA}`);
    expect(resTitle.body.data.length).toBe(1);
  });

  it('11. GET /api/v1/transactions - sort by amount ascending and descending', async () => {
    const resAsc = await request(app)
      .get('/api/v1/transactions?sortBy=amount&sortOrder=asc')
      .set('Authorization', `Bearer ${userTokenA}`);
    expect(resAsc.body.data[0].amount).toBe(450.5);

    const resDesc = await request(app)
      .get('/api/v1/transactions?sortBy=amount&sortOrder=desc')
      .set('Authorization', `Bearer ${userTokenA}`);
    expect(resDesc.body.data[0].amount).toBe(85000);
  });

  it('12. GET /api/v1/transactions/:id - get single transaction details', async () => {
    const res = await request(app)
      .get(`/api/v1/transactions/${createdTxIdA}`)
      .set('Authorization', `Bearer ${userTokenA}`);

    expect(res.status).toBe(200);
    expect(res.body.data._id.toString()).toBe(createdTxIdA.toString());
    expect(res.body.data.category.name).toBe('Food');
  });

  it('13. PUT /api/v1/transactions/:id - update transaction fields', async () => {
    const res = await request(app)
      .put(`/api/v1/transactions/${createdTxIdA}`)
      .set('Authorization', `Bearer ${userTokenA}`)
      .send({
        amount: 520.0,
        title: 'Team Lunch at Olive Garden (Updated)',
        merchant: 'Olive Garden Bistro',
      });

    expect(res.status).toBe(200);
    expect(res.body.data.amount).toBe(520.0);
    expect(res.body.data.title).toBe('Team Lunch at Olive Garden (Updated)');
    expect(res.body.data.merchant).toBe('Olive Garden Bistro');
  });

  it('14. Cross-User Data Access Prevention (IDOR): User B cannot access, update, or delete User A transaction', async () => {
    // User B attempts to read User A's transaction
    const getRes = await request(app)
      .get(`/api/v1/transactions/${createdTxIdA}`)
      .set('Authorization', `Bearer ${userTokenB}`);
    expect(getRes.status).toBe(404);

    // User B attempts to update User A's transaction
    const updateRes = await request(app)
      .put(`/api/v1/transactions/${createdTxIdA}`)
      .set('Authorization', `Bearer ${userTokenB}`)
      .send({ amount: 99999 });
    expect(updateRes.status).toBe(404);

    // User B attempts to delete User A's transaction
    const deleteRes = await request(app)
      .delete(`/api/v1/transactions/${createdTxIdA}`)
      .set('Authorization', `Bearer ${userTokenB}`);
    expect(deleteRes.status).toBe(404);

    // User B's list must be empty
    const listRes = await request(app)
      .get('/api/v1/transactions')
      .set('Authorization', `Bearer ${userTokenB}`);
    expect(listRes.body.data.length).toBe(0);
  });

  it('15. DELETE /api/v1/transactions/:id - delete transaction', async () => {
    const res = await request(app)
      .delete(`/api/v1/transactions/${createdTxIdA}`)
      .set('Authorization', `Bearer ${userTokenA}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);

    const getRes = await request(app)
      .get(`/api/v1/transactions/${createdTxIdA}`)
      .set('Authorization', `Bearer ${userTokenA}`);
    expect(getRes.status).toBe(404);
  });

  it('16. Verify /api/v1/finance/transactions alias endpoint works identically', async () => {
    const res = await request(app)
      .get('/api/v1/finance/transactions')
      .set('Authorization', `Bearer ${userTokenA}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });
});

