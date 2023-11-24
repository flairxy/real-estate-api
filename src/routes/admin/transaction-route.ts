import express from 'express';
import * as controller from '../../controllers/admin/transactions-controller';
import { admin } from '../../middlewares/admin';
import { auth } from '../../middlewares/authenticated';

const router = express.Router();
router.get('/admin/transactions', auth, admin, controller.getTransactions);
router.get('/admin/transaction/:id', auth, admin, controller.find);
router.post('/admin/transaction/:id/verify', auth, admin, controller.verify);
router.post('/admin/transaction/:id/complete', auth, admin, controller.markAsCompleted);
router.post('/admin/transaction/:id/pending', auth, admin, controller.markAsPending);
router.post('/admin/transactions/delete', auth, admin, controller.deleteTransactions);
router.post('/admin/transactions', auth, admin, controller.filter);

export { router as adminTransactionRouter };