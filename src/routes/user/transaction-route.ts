import express from 'express';
import {
  create,
  verify,
  getListing,
  getTransactions,
} from '../../controllers/user/transaction-controller';
import { auth } from '../../middlewares/authenticated';

const router = express.Router();
router.post('/user/transaction/:id/create', auth, create);
router.post('/user/transaction/:id/verify', verify);
router.post('/user/listing', auth, getListing);
router.post('/user/transactions', auth, getTransactions);

export { router as userTransactionRouter };