import express from 'express';
import 'express-async-errors';
import { json } from 'body-parser';
import cors from 'cors';
import dotenv from 'dotenv';
import cookieSession from 'cookie-session';


import { errorHandler } from './middlewares/error-handler';
import { NotFoundError } from './errors/not-found-error';
import { morganMiddleware } from './middlewares/morgan';

// Routes
import { authRouter } from './routes/auth-route';
import { userTransactionRouter } from './routes/user/transaction-route';
import { userAppointmentRouter } from './routes/user/appointment-route';
import { homeRouter } from './routes/user/listing-route';

import { adminUserRouter } from './routes/admin/user-route';
import { adminListRouter } from './routes/admin/listing-route';
import { adminTransactionRouter } from './routes/admin/transaction-route';
import { adminAppointmentRouter } from './routes/admin/appointment-route';

dotenv.config();
const app = express();
app.use(morganMiddleware);
app.set('trust proxy', true); //for nginx
app.use(json({ limit: '30mb' }));
app.use(
  cookieSession({
    signed: false,
    secure: process.env.NODE_ENV === 'production',
  })
);
app.use(cors());

app.use('/api', authRouter);
app.use('/api', userTransactionRouter);
app.use('/api', userAppointmentRouter);
app.use('/api', adminListRouter);
app.use('/api', adminUserRouter);
app.use('/api', adminAppointmentRouter);
app.use('/api', adminTransactionRouter);
app.use('/api', homeRouter);

app.all('*', async () => {
  throw new NotFoundError('Route not found');
});

app.use(errorHandler);

export { app };


