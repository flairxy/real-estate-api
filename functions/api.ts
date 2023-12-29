import express from 'express';
import 'express-async-errors';
import cors from 'cors';
import dotenv from 'dotenv';
import serverless from 'serverless-http';
import { json } from 'body-parser';
import mongoose from 'mongoose';

import { errorHandler } from '../src/middlewares/error-handler';
import { NotFoundError } from '../src/errors/not-found-error';
import { morganMiddleware } from '../src/middlewares/morgan';

// Routes
import { authRouter } from '../src/routes/auth-route';
import { userTransactionRouter } from '../src/routes/user/transaction-route';
import { userAppointmentRouter } from '../src/routes/user/appointment-route';

import { adminUserRouter } from '../src/routes/admin/user-route';
import { adminListRouter } from '../src/routes/admin/listing-route';
import { adminTransactionRouter } from '../src/routes/admin/transaction-route';
import { adminAppointmentRouter } from '../src/routes/admin/appointment-route';
import { homeRouter } from '../src/routes/user/listing-route';

dotenv.config();
const app = express();
app.use(morganMiddleware);
app.use(json({ limit: '30mb' }));
app.use(cors());

app.use('/.netlify/functions/api', authRouter);
app.use('/.netlify/functions/api', userTransactionRouter);
app.use('/.netlify/functions/api', userAppointmentRouter);
app.use('/.netlify/functions/api', adminListRouter);
app.use('/.netlify/functions/api', adminUserRouter);
app.use('/.netlify/functions/api', adminAppointmentRouter);
app.use('/.netlify/functions/api', adminTransactionRouter);
app.use('/.netlify/functions/api', homeRouter);

app.all('*', async () => {
  throw new NotFoundError('Route not found');
});

app.use(errorHandler);
if (
  !process.env.CLOUDINARY_NAME ||
  !process.env.CLOUDINARY_KEY ||
  !process.env.CLOUDINARY_SECRET
) {
  throw new Error('Cloudinary must be set');
}

if (!process.env.SITE_URL) {
  throw new Error('Site URL must be defined');
}

if (!process.env.JWT_KEY) {
  throw new Error('JWT_KEY must be defined');
}
if (!process.env.PAYSTACK_SECRET) {
  throw new Error('Paystack payment must be set');
}
if (!process.env.MONGO_URI) {
  throw new Error('MONGO_URI must be defined');
}

const handler = serverless(app);
module.exports.handler = async (event: any, context: any) => {
  const client = await mongoose.connect(process.env.MONGO_URI!);
  const result = await handler(event, context);
  await client.disconnect();
  return result;
};
