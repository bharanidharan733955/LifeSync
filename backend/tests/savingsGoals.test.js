import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import mongoose from 'mongoose';
import app from '../src/app.js';
import User from '../src/models/User.js';
import FinanceCategory from '../src/models/FinanceCategory.js';
import SavingsGoal from '../src/models/SavingsGoal.js';
import SavingsContribution from '../src/models/SavingsContribution.js';

describe('Phase 3C: Savings Goals Integration Tests', () => {
  let userTokenA;
  let userTokenB;
  let userIdA;
  let userIdB;
  let emergencyGoalId;
  let vacationGoalId;
  let userACategoryId;

  beforeAll(async () => {
    await User.deleteMany({});
    await FinanceCategory.deleteMany({});
    await SavingsGoal.deleteMany({});
    await SavingsContribution.deleteMany({});

    // Register User A
    const resA = await request(app)
      .post('/api/v1/auth/register')
      .send({
        fullName: 'Savings User A',
        email: 'savings_a@lifetrack.test',
        password: 'Password123!',
      });
    userTokenA = resA.body.data.accessToken;
    userIdA = resA.body.data.user.id || resA.body.data.user._id;

    // Register User B
    const resB = await request(app)
      .post('/api/v1/auth/register')
      .send({
        fullName: 'Savings User B',
        email: 'savings_b@lifetrack.test',
        password: 'Password123!',
      });
    userTokenB = resB.body.data.accessToken;
    userIdB = resB.body.data.user.id || resB.body.data.user._id;

    // Create Category for User A
    const catA = await FinanceCategory.create({
      name: 'User A Savings Category',
      type: 'EXPENSE',
      user: userIdA,
      isSystem: false,
    });
    userACategoryId = catA._id.toString();
  });

  afterAll(async () => {
    await SavingsContribution.deleteMany({});
    await SavingsGoal.deleteMany({});
    await FinanceCategory.deleteMany({});
    await User.deleteMany({});
  });

  describe('Authentication & Authorization', () => {
    it('rejects unauthenticated requests to list goals', async () => {
      const res = await request(app).get('/api/v1/savings-goals');
      expect(res.status).toBe(401);
    });

    it('rejects unauthenticated requests to create goals', async () => {
      const res = await request(app)
        .post('/api/v1/savings-goals')
        .send({ name: 'Car Fund', targetAmount: 5000 });
      expect(res.status).toBe(401);
    });
  });

  describe('Savings Goal Validation & Creation', () => {
    it('rejects goal with non-positive target amount', async () => {
      const res = await request(app)
        .post('/api/v1/savings-goals')
        .set('Authorization', `Bearer ${userTokenA}`)
        .send({
          name: 'Zero Target',
          targetAmount: 0,
        });

      expect(res.status).toBe(422);
    });

    it('creates a valid savings goal for User A', async () => {
      const targetDate = new Date();
      targetDate.setMonth(targetDate.getMonth() + 6);

      const res = await request(app)
        .post('/api/v1/savings-goals')
        .set('Authorization', `Bearer ${userTokenA}`)
        .send({
          name: 'Emergency Fund',
          description: '6 months of living expenses',
          targetAmount: 1000,
          currency: 'USD',
          targetDate: targetDate.toISOString(),
          category: userACategoryId,
          color: '#10B981',
          icon: 'Shield',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.name).toBe('Emergency Fund');
      expect(res.body.data.targetAmount).toBe(1000);
      expect(res.body.data.progress.savedAmount).toBe(0);
      expect(res.body.data.progress.percentage).toBe(0);
      expect(res.body.data.progress.remainingAmount).toBe(1000);
      expect(res.body.data.status).toBe('ACTIVE');

      emergencyGoalId = res.body.data._id || res.body.data.id;
    });

    it('creates another savings goal for User A', async () => {
      const res = await request(app)
        .post('/api/v1/savings-goals')
        .set('Authorization', `Bearer ${userTokenA}`)
        .send({
          name: 'Vacation Trip',
          targetAmount: 500,
          currency: 'USD',
        });

      expect(res.status).toBe(201);
      vacationGoalId = res.body.data._id || res.body.data.id;
    });
  });

  describe('Contributions & Dynamic Progress', () => {
    let firstContribId;

    it('rejects contribution with non-positive amount', async () => {
      const res = await request(app)
        .post(`/api/v1/savings-goals/${emergencyGoalId}/contributions`)
        .set('Authorization', `Bearer ${userTokenA}`)
        .send({
          amount: -50,
          description: 'Invalid negative contribution',
        });

      expect(res.status).toBe(422);
    });

    it('adds a valid contribution and recalculates progress', async () => {
      const res = await request(app)
        .post(`/api/v1/savings-goals/${emergencyGoalId}/contributions`)
        .set('Authorization', `Bearer ${userTokenA}`)
        .send({
          amount: 250,
          description: 'First paycheck allocation',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.amount).toBe(250);
      firstContribId = res.body.data._id || res.body.data.id;

      // Verify goal detail reflects the new contribution
      const goalRes = await request(app)
        .get(`/api/v1/savings-goals/${emergencyGoalId}`)
        .set('Authorization', `Bearer ${userTokenA}`);

      expect(goalRes.status).toBe(200);
      expect(goalRes.body.data.progress.savedAmount).toBe(250);
      expect(goalRes.body.data.progress.remainingAmount).toBe(750);
      expect(goalRes.body.data.progress.percentage).toBe(25);
      expect(goalRes.body.data.progress.contributionsCount).toBe(1);
    });

    it('lists contributions for the goal', async () => {
      const res = await request(app)
        .get(`/api/v1/savings-goals/${emergencyGoalId}/contributions`)
        .set('Authorization', `Bearer ${userTokenA}`);

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(1);
      expect(res.body.data[0].amount).toBe(250);
    });

    it('adds additional contributions and handles reaching target', async () => {
      // Add 750 more to reach 1000 total (100%)
      const res = await request(app)
        .post(`/api/v1/savings-goals/${emergencyGoalId}/contributions`)
        .set('Authorization', `Bearer ${userTokenA}`)
        .send({
          amount: 750,
          description: 'Bonus contribution',
        });

      expect(res.status).toBe(201);

      // Verify goal progress is 100% and auto-transitions to COMPLETED
      const goalRes = await request(app)
        .get(`/api/v1/savings-goals/${emergencyGoalId}`)
        .set('Authorization', `Bearer ${userTokenA}`);

      expect(goalRes.status).toBe(200);
      expect(goalRes.body.data.progress.savedAmount).toBe(1000);
      expect(goalRes.body.data.progress.remainingAmount).toBe(0);
      expect(goalRes.body.data.progress.percentage).toBe(100);
      expect(goalRes.body.data.progress.isTargetReached).toBe(true);
      expect(goalRes.body.data.status).toBe('COMPLETED');
    });

    it('handles uncapped percentage when exceeding target', async () => {
      // Add 100 more on top of 1000
      const res = await request(app)
        .post(`/api/v1/savings-goals/${emergencyGoalId}/contributions`)
        .set('Authorization', `Bearer ${userTokenA}`)
        .send({
          amount: 100,
          description: 'Extra buffer',
        });

      expect(res.status).toBe(201);

      const goalRes = await request(app)
        .get(`/api/v1/savings-goals/${emergencyGoalId}`)
        .set('Authorization', `Bearer ${userTokenA}`);

      expect(goalRes.status).toBe(200);
      expect(goalRes.body.data.progress.savedAmount).toBe(1100);
      expect(goalRes.body.data.progress.percentage).toBe(110);
      expect(goalRes.body.data.progress.isExceeded).toBe(true);
    });

    it('deletes a contribution and recalculates progress dynamically', async () => {
      const delRes = await request(app)
        .delete(`/api/v1/savings-goals/${emergencyGoalId}/contributions/${firstContribId}`)
        .set('Authorization', `Bearer ${userTokenA}`);

      expect(delRes.status).toBe(200);

      // Total should now be 1100 - 250 = 850
      const goalRes = await request(app)
        .get(`/api/v1/savings-goals/${emergencyGoalId}`)
        .set('Authorization', `Bearer ${userTokenA}`);

      expect(goalRes.status).toBe(200);
      expect(goalRes.body.data.progress.savedAmount).toBe(850);
      expect(goalRes.body.data.progress.percentage).toBe(85);
    });
  });

  describe('Goal Status Transitions & Updates', () => {
    it('pauses and resumes a savings goal', async () => {
      // Pause
      const pauseRes = await request(app)
        .patch(`/api/v1/savings-goals/${vacationGoalId}/status`)
        .set('Authorization', `Bearer ${userTokenA}`)
        .send({ status: 'PAUSED' });

      expect(pauseRes.status).toBe(200);
      expect(pauseRes.body.data.status).toBe('PAUSED');

      // Cannot add contribution to paused goal
      const contribRes = await request(app)
        .post(`/api/v1/savings-goals/${vacationGoalId}/contributions`)
        .set('Authorization', `Bearer ${userTokenA}`)
        .send({ amount: 50 });

      expect(contribRes.status).toBe(400);

      // Resume
      const resumeRes = await request(app)
        .patch(`/api/v1/savings-goals/${vacationGoalId}/status`)
        .set('Authorization', `Bearer ${userTokenA}`)
        .send({ status: 'ACTIVE' });

      expect(resumeRes.status).toBe(200);
      expect(resumeRes.body.data.status).toBe('ACTIVE');
    });

    it('updates savings goal details', async () => {
      const res = await request(app)
        .put(`/api/v1/savings-goals/${vacationGoalId}`)
        .set('Authorization', `Bearer ${userTokenA}`)
        .send({
          name: 'Dream Vacation 2027',
          targetAmount: 800,
        });

      expect(res.status).toBe(200);
      expect(res.body.data.name).toBe('Dream Vacation 2027');
      expect(res.body.data.targetAmount).toBe(800);
    });
  });

  describe('Summary & Metrics', () => {
    it('returns aggregate summary metrics for User A', async () => {
      const res = await request(app)
        .get('/api/v1/savings-goals/summary')
        .set('Authorization', `Bearer ${userTokenA}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.totalGoals).toBeGreaterThanOrEqual(2);
      expect(res.body.data.totalSaved).toBe(850);
      expect(res.body.data.totalTarget).toBe(1800); // 1000 + 800
    });
  });

  describe('IDOR & Security Isolation', () => {
    it('prevents User B from viewing User A goals', async () => {
      const res = await request(app)
        .get(`/api/v1/savings-goals/${emergencyGoalId}`)
        .set('Authorization', `Bearer ${userTokenB}`);

      expect(res.status).toBe(404);
    });

    it('prevents User B from adding contribution to User A goal', async () => {
      const res = await request(app)
        .post(`/api/v1/savings-goals/${emergencyGoalId}/contributions`)
        .set('Authorization', `Bearer ${userTokenB}`)
        .send({ amount: 100 });

      expect(res.status).toBe(404);
    });

    it('prevents User B from updating User A goal', async () => {
      const res = await request(app)
        .put(`/api/v1/savings-goals/${emergencyGoalId}`)
        .set('Authorization', `Bearer ${userTokenB}`)
        .send({ name: 'Hacked Goal' });

      expect(res.status).toBe(404);
    });

    it('prevents User B from deleting User A goal', async () => {
      const res = await request(app)
        .delete(`/api/v1/savings-goals/${emergencyGoalId}`)
        .set('Authorization', `Bearer ${userTokenB}`);

      expect(res.status).toBe(404);
    });
  });

  describe('Cascade Deletion', () => {
    it('deletes a goal and its contributions', async () => {
      const delRes = await request(app)
        .delete(`/api/v1/savings-goals/${emergencyGoalId}`)
        .set('Authorization', `Bearer ${userTokenA}`);

      expect(delRes.status).toBe(200);

      // Verify contributions were removed
      const remainingContribs = await SavingsContribution.find({ savingsGoal: emergencyGoalId });
      expect(remainingContribs).toHaveLength(0);
    });
  });
});

