// ─── User model unit tests (DB required) ─────────────────────────────────────
// These tests require a MongoDB connection configured via MONGODB_TEST_URI
// or mongodb-memory-server. Set MONGODB_TEST_URI to skip memory server.
import { describe, it, expect, beforeAll, afterAll, afterEach } from 'vitest';
import mongoose from 'mongoose';
import User from '../src/models/User.js';

// Simple in-process MongoDB connection for tests
// Run with: MONGODB_TEST_URI=mongodb://localhost:27017/lifetrack-test npx vitest run

const TEST_URI = process.env.MONGODB_TEST_URI || 'mongodb://127.0.0.1:27017/lifetrack-test';

beforeAll(async () => {
  try {
    await mongoose.connect(TEST_URI, { serverSelectionTimeoutMS: 5000 });
  } catch {
    console.warn('[test] MongoDB not available – skipping model tests');
  }
}, 10000);

afterAll(async () => {
  if (mongoose.connection.readyState === 1) {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
  }
});

afterEach(async () => {
  if (mongoose.connection.readyState === 1) {
    const collections = mongoose.connection.collections;
    for (const key in collections) {
      await collections[key].deleteMany({});
    }
  }
});

const skip = mongoose.connection.readyState !== 1;

describe('User Model', () => {
  it('should create a user with valid data', async () => {
    if (mongoose.connection.readyState !== 1) return;
    const user = await User.create({
      firstName: 'Priya',
      lastName: 'Sharma',
      email: 'priya@test.com',
      password: 'SecurePass123',
    });

    expect(user._id).toBeDefined();
    expect(user.email).toBe('priya@test.com');
    expect(user.firstName).toBe('Priya');
    expect(user.role).toBe('user');
    expect(user.isActive).toBe(true);
    expect(user.isEmailVerified).toBe(false);
  });

  it('should hash the password before saving', async () => {
    if (mongoose.connection.readyState !== 1) return;
    const plainPassword = 'SecurePass123';
    const user = await User.create({
      firstName: 'Test',
      lastName: 'User',
      email: 'hash@test.com',
      password: plainPassword,
    });

    const rawUser = await User.findById(user._id).select('+password');
    expect(rawUser.password).not.toBe(plainPassword);
    expect(rawUser.password).toMatch(/^\$2[ab]\$/);
  });

  it('should not return password in toJSON', async () => {
    if (mongoose.connection.readyState !== 1) return;
    const user = await User.create({
      firstName: 'Test',
      lastName: 'User',
      email: 'nopw@test.com',
      password: 'SecurePass123',
    });
    const json = user.toJSON();
    expect(json.password).toBeUndefined();
  });

  it('comparePassword should return true for correct password', async () => {
    if (mongoose.connection.readyState !== 1) return;
    const user = await User.create({
      firstName: 'Test',
      lastName: 'User',
      email: 'compare@test.com',
      password: 'SecurePass123',
    });
    const rawUser = await User.findById(user._id).select('+password');
    const isMatch = await rawUser.comparePassword('SecurePass123');
    expect(isMatch).toBe(true);
  });

  it('fullName virtual should combine firstName and lastName', async () => {
    if (mongoose.connection.readyState !== 1) return;
    const user = await User.create({
      firstName: 'Priya',
      lastName: 'Sharma',
      email: 'virtual@test.com',
      password: 'SecurePass123',
    });
    expect(user.fullName).toBe('Priya Sharma');
  });
});
