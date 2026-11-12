import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import mongoose from 'mongoose';
import app from '../src/app.js';
import User from '../src/models/User.js';
import FinanceCategory from '../src/models/FinanceCategory.js';
import Transaction from '../src/models/Transaction.js';

describe('Phase 3A: Categories Management Integration Tests', () => {
  let userTokenA;
  let userTokenB;
  let userIdA;
  let userIdB;

  beforeAll(async () => {
    // Clear collections
    await User.deleteMany({});
    await FinanceCategory.deleteMany({});
    await Transaction.deleteMany({});

    // Register User A
    const resA = await request(app)
      .post('/api/v1/auth/register')
      .send({
        fullName: 'Category User A',
        email: 'cat_user_a@lifetrack.test',
        password: 'Password123!',
      });
    userTokenA = resA.body.data.accessToken;
    userIdA = resA.body.data.user.id || resA.body.data.user._id;

    // Register User B
    const resB = await request(app)
      .post('/api/v1/auth/register')
      .send({
        fullName: 'Category User B',
        email: 'cat_user_b@lifetrack.test',
        password: 'Password123!',
      });
    userTokenB = resB.body.data.accessToken;
    userIdB = resB.body.data.user.id || resB.body.data.user._id;
  });

  it('1. GET /api/v1/categories - should seed and return default system categories', async () => {
    const res = await request(app)
      .get('/api/v1/categories')
      .set('Authorization', `Bearer ${userTokenA}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);

    const names = res.body.data.map((c) => c.name);
    // Expense defaults
    expect(names).toContain('Food');
    expect(names).toContain('Transport');
    expect(names).toContain('Groceries');
    expect(names).toContain('Bills');
    // Income defaults
    expect(names).toContain('Salary');
    expect(names).toContain('Freelance');

    // All seeded defaults should have isSystem: true
    const systemCategories = res.body.data.filter((c) => c.isSystem);
    expect(systemCategories.length).toBeGreaterThanOrEqual(19);
  });

  it('2. GET /api/v1/categories?type=EXPENSE - should filter categories by type', async () => {
    const res = await request(app)
      .get('/api/v1/categories?type=EXPENSE')
      .set('Authorization', `Bearer ${userTokenA}`);

    expect(res.status).toBe(200);
    res.body.data.forEach((c) => {
      expect(['EXPENSE', 'BOTH']).toContain(c.type);
    });
  });

  it('3. POST /api/v1/categories - should allow user to create a custom category', async () => {
    const res = await request(app)
      .post('/api/v1/categories')
      .set('Authorization', `Bearer ${userTokenA}`)
      .send({
        name: 'Photography Equipment',
        type: 'EXPENSE',
        icon: 'camera',
        color: '#8b5cf6',
        description: 'Cameras, lenses, and lighting',
      });

    expect(res.status).toBe(201);
    expect(res.body.data.name).toBe('Photography Equipment');
    expect(res.body.data.type).toBe('EXPENSE');
    expect(res.body.data.isSystem).toBe(false);
    expect(res.body.data.user).toBeTruthy();
  });

  it('4. POST /api/v1/categories - should reject duplicate custom category for same user and type', async () => {
    const res = await request(app)
      .post('/api/v1/categories')
      .set('Authorization', `Bearer ${userTokenA}`)
      .send({
        name: 'Photography Equipment',
        type: 'EXPENSE',
      });

    expect(res.status).toBe(409);
    expect(res.body.success).toBe(false);
  });

  it('5. POST /api/v1/categories - should allow different user to create category with same name', async () => {
    const res = await request(app)
      .post('/api/v1/categories')
      .set('Authorization', `Bearer ${userTokenB}`)
      .send({
        name: 'Photography Equipment',
        type: 'EXPENSE',
      });

    expect(res.status).toBe(201);
    expect(res.body.data.user).toBeTruthy();
  });

  it('6. PUT /api/v1/categories/:id - should reject modifying a system category (403 Forbidden)', async () => {
    const categoriesRes = await request(app)
      .get('/api/v1/categories')
      .set('Authorization', `Bearer ${userTokenA}`);

    const systemCategory = categoriesRes.body.data.find((c) => c.isSystem && c.name === 'Food');
    expect(systemCategory).toBeDefined();

    const updateRes = await request(app)
      .put(`/api/v1/categories/${systemCategory._id}`)
      .set('Authorization', `Bearer ${userTokenA}`)
      .send({
        name: 'Modified Food Category',
      });

    expect(updateRes.status).toBe(403);
    expect(updateRes.body.success).toBe(false);
  });

  it('7. DELETE /api/v1/categories/:id - should reject deleting a system category (403 Forbidden)', async () => {
    const categoriesRes = await request(app)
      .get('/api/v1/categories')
      .set('Authorization', `Bearer ${userTokenA}`);

    const systemCategory = categoriesRes.body.data.find((c) => c.isSystem && c.name === 'Salary');
    expect(systemCategory).toBeDefined();

    const deleteRes = await request(app)
      .delete(`/api/v1/categories/${systemCategory._id}`)
      .set('Authorization', `Bearer ${userTokenA}`);

    expect(deleteRes.status).toBe(403);
    expect(deleteRes.body.success).toBe(false);
  });

  it('8. Cross-User Isolation: User B cannot modify or delete User A custom category', async () => {
    // User A creates a unique category
    const createRes = await request(app)
      .post('/api/v1/categories')
      .set('Authorization', `Bearer ${userTokenA}`)
      .send({
        name: 'User A Private Category',
        type: 'EXPENSE',
      });
    const categoryId = createRes.body.data._id;

    // User B tries to update it
    const updateRes = await request(app)
      .put(`/api/v1/categories/${categoryId}`)
      .set('Authorization', `Bearer ${userTokenB}`)
      .send({ name: 'Hacked by B' });
    expect([403, 404]).toContain(updateRes.status);

    // User B tries to delete it
    const deleteRes = await request(app)
      .delete(`/api/v1/categories/${categoryId}`)
      .set('Authorization', `Bearer ${userTokenB}`);
    expect([403, 404]).toContain(deleteRes.status);
  });

  it('9. DELETE /api/v1/categories/:id - should reject deleting a custom category linked to active transactions', async () => {
    // Create custom category for User A
    const catRes = await request(app)
      .post('/api/v1/categories')
      .set('Authorization', `Bearer ${userTokenA}`)
      .send({
        name: 'Gym Equipment',
        type: 'EXPENSE',
      });
    const catId = catRes.body.data._id;

    // Create transaction using this category
    await request(app)
      .post('/api/v1/transactions')
      .set('Authorization', `Bearer ${userTokenA}`)
      .send({
        title: 'Bought Dumbbells',
        type: 'EXPENSE',
        amount: 2500,
        category: catId,
        paymentMethod: 'UPI',
      });

    // Try deleting category
    const deleteRes = await request(app)
      .delete(`/api/v1/categories/${catId}`)
      .set('Authorization', `Bearer ${userTokenA}`);

    expect(deleteRes.status).toBe(400);
    expect(deleteRes.body.code).toBe('CATEGORY_IN_USE');
  });

  it('10. DELETE /api/v1/categories/:id - should successfully delete unused custom category', async () => {
    const catRes = await request(app)
      .post('/api/v1/categories')
      .set('Authorization', `Bearer ${userTokenA}`)
      .send({
        name: 'Temporary Category',
        type: 'INCOME',
      });
    const catId = catRes.body.data._id;

    const deleteRes = await request(app)
      .delete(`/api/v1/categories/${catId}`)
      .set('Authorization', `Bearer ${userTokenA}`);

    expect(deleteRes.status).toBe(200);
    expect(deleteRes.body.success).toBe(true);

    // Confirm it is gone
    const getRes = await request(app)
      .get(`/api/v1/categories/${catId}`)
      .set('Authorization', `Bearer ${userTokenA}`);
    expect(getRes.status).toBe(404);
  });
});

