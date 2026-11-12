import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import app from '../src/app.js';
import User from '../src/models/User.js';
import RefreshToken from '../src/models/RefreshToken.js';
import { env } from '../src/config/env.js';

describe('Phase 2: Authentication & Authorization Integration Tests', () => {
  const testUser = {
    fullName: 'Priya Sharma',
    email: 'priya.auth.test@lifetrack.app',
    password: 'SecurePassword123',
    confirmPassword: 'SecurePassword123',
  };

  let testAccessToken = '';
  let testRefreshToken = '';
  let testUserId = '';

  beforeAll(async () => {
    await User.deleteMany({ email: /.*auth\.test@lifetrack\.app/ });
    await RefreshToken.deleteMany({});
  });

  afterAll(async () => {
    await User.deleteMany({ email: /.*auth\.test@lifetrack\.app/ });
    await RefreshToken.deleteMany({});
  });

  // ── 1. Successful Registration ──────────────────────────────────────────────
  it('1. POST /api/v1/auth/register - should successfully register a new user with hashed password', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send(testUser);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user.email).toBe(testUser.email.toLowerCase());
    expect(res.body.data.user.fullName).toBe(testUser.fullName);
    expect(res.body.data.user.password).toBeUndefined();
    expect(res.body.data.user.status).toBe('ACTIVE');
    expect(res.body.data.accessToken).toBeDefined();
    expect(res.body.data.refreshToken).toBeDefined();

    // Check Set-Cookie for HTTP-only refresh token
    const cookies = res.headers['set-cookie'];
    expect(cookies).toBeDefined();
    expect(cookies.some((c) => c.includes('refreshToken='))).toBe(true);

    testUserId = res.body.data.user.id;
    testAccessToken = res.body.data.accessToken;
    testRefreshToken = res.body.data.refreshToken;

    // Verify in database that password was actually hashed
    const dbUser = await User.findById(testUserId).select('+password');
    expect(dbUser.password).not.toBe(testUser.password);
    expect(dbUser.password).toMatch(/^\$2[ab]\$/);
  });

  // ── 2. Duplicate Email Registration ─────────────────────────────────────────
  it('2. POST /api/v1/auth/register - should reject duplicate email with 409 Conflict', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send(testUser);

    expect(res.status).toBe(409);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/already exists/i);
  });

  // ── 3. Successful Login ─────────────────────────────────────────────────────
  it('3. POST /api/v1/auth/login - should log in with valid credentials and return access + refresh tokens', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: testUser.email,
        password: testUser.password,
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.accessToken).toBeDefined();
    expect(res.body.data.refreshToken).toBeDefined();
    expect(res.body.data.user.email).toBe(testUser.email.toLowerCase());

    testAccessToken = res.body.data.accessToken;
    testRefreshToken = res.body.data.refreshToken;
  });

  // ── 4. Invalid Credentials ──────────────────────────────────────────────────
  it('4. POST /api/v1/auth/login - should reject incorrect password with 401 Unauthorized', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: testUser.email,
        password: 'IncorrectPassword999',
      });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/invalid email or password/i);
  });

  // ── 5. Unauthorized API Request ─────────────────────────────────────────────
  it('5. GET /api/v1/auth/me - should reject request without Authorization header', async () => {
    const res = await request(app).get('/api/v1/auth/me');

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/no authentication token provided/i);
  });

  // ── 6. Authorized API Request ───────────────────────────────────────────────
  it('6. GET /api/v1/auth/me & GET /api/v1/users/me - should return authenticated user profile', async () => {
    const resAuthMe = await request(app)
      .get('/api/v1/auth/me')
      .set('Authorization', `Bearer ${testAccessToken}`);

    expect(resAuthMe.status).toBe(200);
    expect(resAuthMe.body.data.user.email).toBe(testUser.email.toLowerCase());
    expect(resAuthMe.body.data.user.fullName).toBe(testUser.fullName);

    const resUsersMe = await request(app)
      .get('/api/v1/users/me')
      .set('Authorization', `Bearer ${testAccessToken}`);

    expect(resUsersMe.status).toBe(200);
    expect(resUsersMe.body.data.user.id).toBe(testUserId);
  });

  // ── 7. Profile Update (PUT /users/me) ────────────────────────────────────────
  it('7. PUT /api/v1/users/me - should update user profile', async () => {
    const updatedName = 'Priya Sharma Updated';
    const res = await request(app)
      .put('/api/v1/users/me')
      .set('Authorization', `Bearer ${testAccessToken}`)
      .send({ fullName: updatedName });

    expect(res.status).toBe(200);
    expect(res.body.data.user.fullName).toBe(updatedName);
  });

  // ── 8. Expired Access Token ─────────────────────────────────────────────────
  it('8. GET /api/v1/auth/me - should reject expired access token with 401', async () => {
    // Generate intentionally expired token (-10 seconds)
    const expiredToken = jwt.sign(
      { sub: testUserId, email: testUser.email },
      env.JWT_ACCESS_SECRET,
      { expiresIn: '-10s' }
    );

    const res = await request(app)
      .get('/api/v1/auth/me')
      .set('Authorization', `Bearer ${expiredToken}`);

    expect(res.status).toBe(401);
    expect(res.body.message).toMatch(/expired/i);
  });

  // ── 9. Refresh-Token Rotation & Reuse Detection ─────────────────────────────
  it('9. POST /api/v1/auth/refresh - should rotate refresh token and issue new token pair', async () => {
    const res = await request(app)
      .post('/api/v1/auth/refresh')
      .send({ refreshToken: testRefreshToken });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.accessToken).toBeDefined();
    expect(res.body.data.refreshToken).toBeDefined();
    expect(res.body.data.refreshToken).not.toBe(testRefreshToken);

    const oldRefreshToken = testRefreshToken;
    const newRefreshToken = res.body.data.refreshToken;

    // ── REUSE DETECTION TEST ──
    // Attempting to present the old rotated refresh token MUST trigger reuse detection!
    const reuseAttemptRes = await request(app)
      .post('/api/v1/auth/refresh')
      .send({ refreshToken: oldRefreshToken });

    expect(reuseAttemptRes.status).toBe(403);
    expect(reuseAttemptRes.body.message).toMatch(/reuse detected/i);

    // Verify that the replacement token was also revoked as security measure
    const afterReuseRes = await request(app)
      .post('/api/v1/auth/refresh')
      .send({ refreshToken: newRefreshToken });

    expect(afterReuseRes.status).toBe(403); // All user sessions invalidated!
  });

  // ── 10. Suspended Account Access Blocked ─────────────────────────────────────
  it('10. Suspended accounts must be blocked from login and authenticated APIs with 403', async () => {
    // Create a suspended user
    const suspendedUser = await User.create({
      fullName: 'Suspended Account User',
      email: 'suspended.auth.test@lifetrack.app',
      password: 'SecurePassword123',
      status: 'SUSPENDED',
    });

    // 1. Login attempt must fail
    const loginRes = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: suspendedUser.email,
        password: 'SecurePassword123',
      });

    expect(loginRes.status).toBe(403);
    expect(loginRes.body.message).toMatch(/suspended/i);

    // 2. Token presentation from suspended user must fail
    const token = jwt.sign(
      { sub: suspendedUser._id.toString(), email: suspendedUser.email },
      env.JWT_ACCESS_SECRET,
      { expiresIn: '15m' }
    );

    const apiRes = await request(app)
      .get('/api/v1/auth/me')
      .set('Authorization', `Bearer ${token}`);

    expect(apiRes.status).toBe(403);
    expect(apiRes.body.message).toMatch(/suspended/i);
  });

  // ── 11. Logout and Logout-All ───────────────────────────────────────────────
  it('11. POST /api/v1/auth/logout & /logout-all - should revoke sessions', async () => {
    // Log in again to get fresh session
    const loginRes = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: testUser.email,
        password: testUser.password,
      });

    const activeAccessToken = loginRes.body.data.accessToken;
    const activeRefreshToken = loginRes.body.data.refreshToken;

    // Logout specific session
    const logoutRes = await request(app)
      .post('/api/v1/auth/logout')
      .send({ refreshToken: activeRefreshToken });

    expect(logoutRes.status).toBe(200);

    // That refresh token should no longer work
    const refreshAfterLogout = await request(app)
      .post('/api/v1/auth/refresh')
      .send({ refreshToken: activeRefreshToken });

    expect(refreshAfterLogout.status).toBe(403); // Was revoked, so reuse detected

    // Log in again
    const freshLogin = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: testUser.email, password: testUser.password });

    const freshAccessToken = freshLogin.body.data.accessToken;

    // Logout-all
    const logoutAllRes = await request(app)
      .post('/api/v1/auth/logout-all')
      .set('Authorization', `Bearer ${freshAccessToken}`);

    expect(logoutAllRes.status).toBe(200);
    expect(logoutAllRes.body.message).toMatch(/all active sessions/i);
  });

  // ── 12. Cross-User Data Access Prevention ───────────────────────────────────
  it('12. Enforce cross-user data isolation: APIs obtain user ID from verified token only', async () => {
    // Create another user
    const otherUser = await User.create({
      fullName: 'Other User',
      email: 'other.auth.test@lifetrack.app',
      password: 'SecurePassword123',
      status: 'ACTIVE',
    });

    const otherToken = jwt.sign(
      { sub: otherUser._id.toString(), email: otherUser.email },
      env.JWT_ACCESS_SECRET,
      { expiresIn: '15m' }
    );

    // Call /users/me with otherUser token -> must return otherUser data, not testUser data
    const res = await request(app)
      .get('/api/v1/users/me')
      .set('Authorization', `Bearer ${otherToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.user.id).toBe(otherUser._id.toString());
    expect(res.body.data.user.email).toBe(otherUser.email);
    expect(res.body.data.user.id).not.toBe(testUserId);
  });
});

