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
    console.warn('[DB] MongoDB Atlas connection failed:', error.message);
    if (env.NODE_ENV === 'development') {
      console.log('[DB] Starting local in-memory MongoDB for development fallback...');
      try {
        const { MongoMemoryServer } = await import('mongodb-memory-server');
        const mongod = await MongoMemoryServer.create({
          instance: { dbName: 'lifetrack_dev' },
        });
        const uri = mongod.getUri();
        await mongoose.connect(uri);
        isConnected = true;
        console.log(`[DB] Connected to local in-memory development MongoDB at ${uri}`);

        // Seed default categories if none exist
        const FinanceCategory = (await import('../models/FinanceCategory.js')).default;
        const count = await FinanceCategory.countDocuments({ isSystem: true });
        if (count === 0) {
          await FinanceCategory.insertMany([
            { name: 'Food & Dining', type: 'EXPENSE', icon: 'utensils', color: '#f59e0b', isSystem: true },
            { name: 'Housing & Rent', type: 'EXPENSE', icon: 'home', color: '#6366f1', isSystem: true },
            { name: 'Groceries', type: 'EXPENSE', icon: 'shopping-cart', color: '#10b981', isSystem: true },
            { name: 'Utilities & Bills', type: 'EXPENSE', icon: 'zap', color: '#3b82f6', isSystem: true },
            { name: 'Transportation', type: 'EXPENSE', icon: 'car', color: '#8b5cf6', isSystem: true },
            { name: 'Salary & Earnings', type: 'INCOME', icon: 'briefcase', color: '#059669', isSystem: true },
            { name: 'Freelance & Projects', type: 'INCOME', icon: 'laptop', color: '#14b8a6', isSystem: true },
            { name: 'Investments', type: 'INCOME', icon: 'trending-up', color: '#2563eb', isSystem: true },
            { name: 'Healthcare', type: 'EXPENSE', icon: 'heart', color: '#ef4444', isSystem: true },
            { name: 'Entertainment', type: 'EXPENSE', icon: 'film', color: '#ec4899', isSystem: true },
          ]);
          console.log('[DB] Seeded 10 default system finance categories');
        }

        return mongoose.connection;
      } catch (innerErr) {
        console.error('[DB] Local in-memory DB start failed:', innerErr.message);
      }
    }
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

