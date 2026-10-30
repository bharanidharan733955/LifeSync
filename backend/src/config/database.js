import mongoose from 'mongoose';
import { env } from './env.js';

// ─── MongoDB connection manager ──────────────────────────────────────────────
// Maintains a single connection throughout the application lifecycle.
// Uses Mongoose connection events for monitoring.

const MONGO_OPTIONS = {
  // Mongoose 7+ handles pooling automatically; these are still useful
  maxPoolSize: 10,
  minPoolSize: 2,
  serverSelectionTimeoutMS: 10000,
  socketTimeoutMS: 45000,
  connectTimeoutMS: 10000,
  family: 4, // Use IPv4
};

let isConnected = false;

export const connectDB = async () => {
  if (isConnected) {
    console.log('[DB] Already connected to MongoDB');
    return mongoose.connection;
  }

  try {
    console.log('[DB] Connecting to MongoDB...');
    await mongoose.connect(env.MONGODB_URI, MONGO_OPTIONS);
    isConnected = true;
    console.log(`[DB] Connected to MongoDB: ${mongoose.connection.host}`);
    return mongoose.connection;
  } catch (error) {
    console.error('[DB] MongoDB connection failed:', error.message);
    process.exit(1);
  }
};

// ─── Connection event listeners ──────────────────────────────────────────────
mongoose.connection.on('connected', () => {
  isConnected = true;
  console.log('[DB] Mongoose connected');
});

mongoose.connection.on('error', (err) => {
  console.error('[DB] Mongoose error:', err.message);
  isConnected = false;
});

mongoose.connection.on('disconnected', () => {
  console.warn('[DB] Mongoose disconnected');
  isConnected = false;
});

// ─── Graceful shutdown ───────────────────────────────────────────────────────
export const disconnectDB = async () => {
  if (!isConnected) return;
  await mongoose.connection.close();
  isConnected = false;
  console.log('[DB] MongoDB connection closed');
};

process.on('SIGINT', async () => {
  await disconnectDB();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await disconnectDB();
  process.exit(0);
});

export default connectDB;

