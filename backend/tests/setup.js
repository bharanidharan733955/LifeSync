import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

let mongod = null;

beforeAll(async () => {
  // Start an isolated, high-performance in-memory MongoDB instance
  mongod = await MongoMemoryServer.create({
    instance: {
      dbName: 'lifetrack_test',
    },
  });

  const uri = mongod.getUri();
  await mongoose.connect(uri);
}, 300000);

afterAll(async () => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
  }
  if (mongod) {
    await mongod.stop();
  }
}, 60000);
