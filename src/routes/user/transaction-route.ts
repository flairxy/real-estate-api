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
router.get('/user/listings', auth, getListing);
router.post('/user/transactions', auth, getTransactions);
router.post('/user/transaction/:reference/verify', verify);

export { router as userTransactionRouter };