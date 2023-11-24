import express from 'express';
import {
  create,
  verify,
} from '../../controllers/user/transaction-controller';
import { auth } from '../../middlewares/authenticated';

const router = express.Router();
router.post('/user/transaction/:id/create', auth, create);
router.post('/user/transaction/:id/verify', auth, verify);

export { router as userTransactionRouter };