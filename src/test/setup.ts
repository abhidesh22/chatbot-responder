import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import { app } from '../app';

jest.setTimeout(80000);

let mongo: any;
beforeAll(async () => {

    mongo = await MongoMemoryServer.create();
    const mongoUri = mongo.getUri();

    await mongoose.connect(mongoUri);
    const collections = await mongoose.connection.db.collections();
    for (let collection of collections) {
        await collection.deleteMany({});
    }
});

beforeEach(async () => {
    // nothing to perform before each test case so far
});

afterAll(async () => {
    await mongo.stop();
    await mongoose.connection.close();
});

