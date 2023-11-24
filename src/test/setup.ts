import request from 'supertest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import { app } from '../app';
import { User } from '../models/user';
import { Roles } from '../utils/constants';

declare global {
  var login: () => Promise<string>;
  var adminLogin: () => Promise<string>;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let mongo: any;
beforeAll(async () => {
  process.env.JWT_KEY = 'asdf';
  mongo = await MongoMemoryServer.create();
  const mongoUri = mongo.getUri();

  await mongoose.connect(mongoUri);
});

//this hook clears the db before each test is run
beforeEach(async () => {
  const collections = await mongoose.connection.db.collections();
  for (const collection of collections) {
    await collection.deleteMany({});
  }
});

//disconnect when all tests are finished
afterAll(async () => {
  if (mongo) {
    await mongo.stop();
  }
  await mongoose.connection.close();
});

interface UserData {
  firstname: string;
  lastname: string;
  phone: string;
  email: string;
  password: string;
}

const userDetails: UserData = {
  firstname: 'Test',
  lastname: 'User',
  phone: '0123456789',
  email: 'user@example.com',
  password: 'password',
};

global.login = async () => {
  const user = User.generate({ ...userDetails, role: Roles.USER });
  await user.save();
  const response = await request(app)
    .post('/api/login')
    .send({ email: userDetails.email, password: userDetails.password })
    .expect(200);

  const cookie = response.body.token;

  return cookie;
};

global.adminLogin = async () => {
  const user = User.generate({ ...userDetails, role: Roles.ADMIN });
  await user.save();

  const response = await request(app)
    .post('/api/login')
    .send({ email: userDetails.email, password: userDetails.password })
    .expect(200);

  const cookie = response.body.token;

  return cookie;
};
