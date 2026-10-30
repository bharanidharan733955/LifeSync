// ─── Test setup ──────────────────────────────────────────────────────────────
// Uses mongodb-memory-server for isolated, fast tests.
// Set MONGODB_TEST_URI env var to use a real MongoDB instance instead.

import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';

// Force the download directory to avoid traversal above project root
process.env['MONGOMS_DOWNLOAD_DIR'] = process.cwd() + '/.cache/mongodb-binaries';
process.env['MONGOMS_PREFER_GLOBAL_PATH'] = '0';
process.env['MONGOMS_VERSION'] = '7.0.14';

let mongod;

beforeAll(async () => {
  if (process.env.MONGODB_TEST_URI) {
    await mongoose.connect(process.env.MONGODB_TEST_URI);
  } else {
    mongod = await MongoMemoryServer.create({
      instance: { dbName: 'lifetrack-test' },
    });
    await mongoose.connect(mongod.getUri());
  }
}, 60000);

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
  if (mongod) await mongod.stop();
});

afterEach(async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
});
