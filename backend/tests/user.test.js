import { describe, it, expect } from 'vitest';
import mongoose from 'mongoose';
import User from '../src/models/User.js';

describe('User Model', () => {
  it('should create a user with valid data and default ACTIVE status', async () => {
    if (mongoose.connection.readyState !== 1) return;
    const user = await User.create({
      fullName: 'Priya Sharma',
      email: 'priya.model@test.com',
      password: 'SecurePass123',
    });

    expect(user._id).toBeDefined();
    expect(user.fullName).toBe('Priya Sharma');
    expect(user.email).toBe('priya.model@test.com');
    expect(user.status).toBe('ACTIVE');
    expect(user.profileImage).toBeNull();
  });

  it('should hash the password before saving and not store plain text', async () => {
    if (mongoose.connection.readyState !== 1) return;
    const plainPassword = 'SecurePass123';
    const user = await User.create({
      fullName: 'Hash Test',
      email: 'hash.model@test.com',
      password: plainPassword,
    });

    const rawUser = await User.findById(user._id).select('+password');
    expect(rawUser.password).not.toBe(plainPassword);
    expect(rawUser.password).toMatch(/^\$2[ab]\$/); // bcrypt format
  });

  it('should exclude password from toJSON representation', async () => {
    if (mongoose.connection.readyState !== 1) return;
    const user = await User.create({
      fullName: 'No Password Leak',
      email: 'nopw.model@test.com',
      password: 'SecurePass123',
    });

    const json = user.toJSON();
    expect(json.password).toBeUndefined();
    expect(json.id).toBeDefined();
  });

  it('comparePassword should return true for correct password and false for wrong', async () => {
    if (mongoose.connection.readyState !== 1) return;
    const user = await User.create({
      fullName: 'Compare Test',
      email: 'compare.model@test.com',
      password: 'SecurePass123',
    });

    const rawUser = await User.findById(user._id).select('+password');
    expect(await rawUser.comparePassword('SecurePass123')).toBe(true);
    expect(await rawUser.comparePassword('WrongPassword')).toBe(false);
  });
});
