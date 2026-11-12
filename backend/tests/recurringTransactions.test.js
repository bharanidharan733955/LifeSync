import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import mongoose from 'mongoose';
import app from '../src/app.js';
import User from '../src/models/User.js';
import FinanceCategory from '../src/models/FinanceCategory.js';
import Transaction from '../src/models/Transaction.js';
import RecurringTransaction from '../src/models/RecurringTransaction.js';
import { generateDueTransactions } from '../src/services/recurringTransactionService.js';

describe('Phase 3C: Recurring Transactions Integration Tests', () => {
  let userTokenA;
  let userTokenB;
  let userIdA;
  let userIdB;
  let userACategoryId;
  let userAIncomeCatId;
  let recurringRentId;
  let recurringSalaryId;

  beforeAll(async () => {
    await User.deleteMany({});
    await FinanceCategory.deleteMany({});
    await Transaction.deleteMany({});
    await RecurringTransaction.deleteMany({});

    // Register User A
    const resA = await request(app)
      .post('/api/v1/auth/register')
      .send({
        fullName: 'Recurring User A',
        email: 'recurring_a@lifetrack.test',
        password: 'Password123!',
      });
    userTokenA = resA.body.data.accessToken;
    userIdA = resA.body.data.user.id || resA.body.data.user._id;

    // Register User B
    const resB = await request(app)
      .post('/api/v1/auth/register')
      .send({
        fullName: 'Recurring User B',
        email: 'recurring_b@lifetrack.test',
        password: 'Password123!',
      });
    userTokenB = resB.body.data.accessToken;
    userIdB = resB.body.data.user.id || resB.body.data.user._id;

    // Category for User A
    const catA = await FinanceCategory.create({
      name: 'Housing & Rent',
      type: 'EXPENSE',
      user: userIdA,
      isSystem: false,
    });
    userACategoryId = catA._id.toString();

    const catIncome = await FinanceCategory.create({
      name: 'Freelance & Salary',
      type: 'INCOME',
      user: userIdA,
      isSystem: false,
    });
    userAIncomeCatId = catIncome._id.toString();
  });

  afterAll(async () => {
    await Transaction.deleteMany({});
    await RecurringTransaction.deleteMany({});
    await FinanceCategory.deleteMany({});
    await User.deleteMany({});
  });

  describe('Authentication & Authorization', () => {
    it('rejects unauthenticated requests to list recurring rules', async () => {
      const res = await request(app).get('/api/v1/recurring-transactions');
      expect(res.status).toBe(401);
    });

    it('rejects unauthenticated requests to create recurring rule', async () => {
      const res = await request(app)
        .post('/api/v1/recurring-transactions')
        .send({ title: 'Rent', amount: 1200 });
      expect(res.status).toBe(401);
    });
  });

  describe('Validation & Creation', () => {
    it('rejects recurring transaction with invalid frequency', async () => {
      const res = await request(app)
        .post('/api/v1/recurring-transactions')
        .set('Authorization', `Bearer ${userTokenA}`)
        .send({
          type: 'EXPENSE',
          title: 'Invalid Frequency',
          amount: 50,
          category: userACategoryId,
          frequency: 'BI_MONTHLY',
          startDate: new Date().toISOString(),
        });

      expect(res.status).toBe(422);
    });

    it('rejects recurring transaction where endDate <= startDate', async () => {
      const start = new Date();
      const end = new Date(start.getTime() - 86400000); // 1 day earlier

      const res = await request(app)
        .post('/api/v1/recurring-transactions')
        .set('Authorization', `Bearer ${userTokenA}`)
        .send({
          type: 'EXPENSE',
          title: 'Invalid End Date',
          amount: 100,
          category: userACategoryId,
          frequency: 'MONTHLY',
          startDate: start.toISOString(),
          endDate: end.toISOString(),
        });

      expect(res.status).toBe(422);
    });

    it('creates a monthly expense recurring transaction (Rent)', async () => {
      const start = new Date();
      const end = new Date();
      end.setFullYear(end.getFullYear() + 1);

      const res = await request(app)
        .post('/api/v1/recurring-transactions')
        .set('Authorization', `Bearer ${userTokenA}`)
        .send({
          type: 'EXPENSE',
          title: 'Apartment Rent',
          description: 'Monthly flat rent',
          amount: 1500,
          currency: 'USD',
          category: userACategoryId,
          paymentMethod: 'NET_BANKING',
          frequency: 'MONTHLY',
          interval: 1,
          startDate: start.toISOString(),
          endDate: end.toISOString(),
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.title).toBe('Apartment Rent');
      expect(res.body.data.amount).toBe(1500);
      expect(res.body.data.frequency).toBe('MONTHLY');
      expect(res.body.data.isActive).toBe(true);
      expect(res.body.data.nextOccurrence).toBeDefined();

      recurringRentId = res.body.data._id || res.body.data.id;
    });

    it('creates a weekly income recurring transaction (Salary / Freelance)', async () => {
      const start = new Date();

      const res = await request(app)
        .post('/api/v1/recurring-transactions')
        .set('Authorization', `Bearer ${userTokenA}`)
        .send({
          type: 'INCOME',
          title: 'Weekly Retainer',
          amount: 800,
          currency: 'USD',
          category: userAIncomeCatId,
          paymentMethod: 'UPI',
          frequency: 'WEEKLY',
          interval: 1,
          startDate: start.toISOString(),
        });

      expect(res.status).toBe(201);
      recurringSalaryId = res.body.data._id || res.body.data.id;
    });
  });

  describe('Retrieval & Filtering', () => {
    it('lists all recurring transactions for User A', async () => {
      const res = await request(app)
        .get('/api/v1/recurring-transactions')
        .set('Authorization', `Bearer ${userTokenA}`);

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(2);
    });

    it('filters recurring transactions by type', async () => {
      const res = await request(app)
        .get('/api/v1/recurring-transactions?type=EXPENSE')
        .set('Authorization', `Bearer ${userTokenA}`);

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(1);
      expect(res.body.data[0].title).toBe('Apartment Rent');
    });

    it('retrieves single recurring transaction details', async () => {
      const res = await request(app)
        .get(`/api/v1/recurring-transactions/${recurringRentId}`)
        .set('Authorization', `Bearer ${userTokenA}`);

      expect(res.status).toBe(200);
      expect(res.body.data.title).toBe('Apartment Rent');
    });
  });

  describe('Pause & Resume', () => {
    it('pauses a recurring transaction', async () => {
      const res = await request(app)
        .patch(`/api/v1/recurring-transactions/${recurringSalaryId}/status`)
        .set('Authorization', `Bearer ${userTokenA}`)
        .send({ isActive: false });

      expect(res.status).toBe(200);
      expect(res.body.data.isActive).toBe(false);
    });

    it('resumes a recurring transaction', async () => {
      const res = await request(app)
        .patch(`/api/v1/recurring-transactions/${recurringSalaryId}/status`)
        .set('Authorization', `Bearer ${userTokenA}`)
        .send({ isActive: true });

      expect(res.status).toBe(200);
      expect(res.body.data.isActive).toBe(true);
    });
  });

  describe('Automatic Transaction Generation & Idempotency', () => {
    it('generates transaction for due recurring schedule', async () => {
      // Set nextOccurrence to 1 hour ago so it is due
      const pastDate = new Date(Date.now() - 3600000);
      await RecurringTransaction.updateOne(
        { _id: recurringRentId },
        { nextOccurrence: pastDate, startDate: pastDate }
      );

      // Trigger generation service
      const genResult = await generateDueTransactions(new Date());

      expect(genResult.processedCount).toBeGreaterThanOrEqual(1);
      expect(genResult.generatedCount).toBeGreaterThanOrEqual(1);

      // Verify Transaction was created with recurringTransactionId
      const generatedTx = await Transaction.findOne({ recurringTransactionId: recurringRentId });
      expect(generatedTx).toBeDefined();
      expect(parseFloat(generatedTx.amount.toString())).toBe(1500);
      expect(generatedTx.type).toBe('EXPENSE');
      expect(generatedTx.title).toBe('Apartment Rent');

      // Verify recurring schedule advanced to next occurrence in the future
      const updatedRec = await RecurringTransaction.findById(recurringRentId);
      expect(new Date(updatedRec.nextOccurrence).getTime()).toBeGreaterThan(pastDate.getTime());
    });

    it('is idempotent: will not create duplicate transactions on re-execution', async () => {
      // Re-run generation with same reference date
      const genResult = await generateDueTransactions(new Date());

      // Should not generate additional duplicate transactions
      const txCount = await Transaction.countDocuments({ recurringTransactionId: recurringRentId });
      expect(txCount).toBe(1);
    });

    it('returns history of generated transactions for a recurring rule', async () => {
      const res = await request(app)
        .get(`/api/v1/recurring-transactions/${recurringRentId}/history`)
        .set('Authorization', `Bearer ${userTokenA}`);

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(1);
      expect(res.body.data[0].amount).toBe(1500);
    });
  });

  describe('IDOR & Security Isolation', () => {
    it('prevents User B from viewing User A recurring transaction', async () => {
      const res = await request(app)
        .get(`/api/v1/recurring-transactions/${recurringRentId}`)
        .set('Authorization', `Bearer ${userTokenB}`);

      expect(res.status).toBe(404);
    });

    it('prevents User B from updating User A recurring transaction', async () => {
      const res = await request(app)
        .put(`/api/v1/recurring-transactions/${recurringRentId}`)
        .set('Authorization', `Bearer ${userTokenB}`)
        .send({ amount: 1 });

      expect(res.status).toBe(404);
    });

    it('prevents User B from pausing User A recurring transaction', async () => {
      const res = await request(app)
        .patch(`/api/v1/recurring-transactions/${recurringRentId}/status`)
        .set('Authorization', `Bearer ${userTokenB}`)
        .send({ isActive: false });

      expect(res.status).toBe(404);
    });

    it('prevents User B from accessing history of User A recurring transaction', async () => {
      const res = await request(app)
        .get(`/api/v1/recurring-transactions/${recurringRentId}/history`)
        .set('Authorization', `Bearer ${userTokenB}`);

      expect(res.status).toBe(404);
    });

    it('prevents User B from deleting User A recurring transaction', async () => {
      const res = await request(app)
        .delete(`/api/v1/recurring-transactions/${recurringRentId}`)
        .set('Authorization', `Bearer ${userTokenB}`);

      expect(res.status).toBe(404);
    });
  });

  describe('Deletion', () => {
    it('deletes recurring transaction rule without deleting previously generated transactions', async () => {
      const res = await request(app)
        .delete(`/api/v1/recurring-transactions/${recurringRentId}`)
        .set('Authorization', `Bearer ${userTokenA}`);

      expect(res.status).toBe(200);

      // Verify recurring schedule is deleted
      const found = await RecurringTransaction.findById(recurringRentId);
      expect(found).toBeNull();

      // Verify generated historical transaction still exists for user financial accuracy
      const tx = await Transaction.findOne({ recurringTransactionId: recurringRentId });
      expect(tx).not.toBeNull();
    });
  });
});
