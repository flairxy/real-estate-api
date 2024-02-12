import express from 'express';
import { body } from 'express-validator';
import {
  getContractors, create, update, deleteContractor
} from '../../controllers/admin/contractor-controller';
import { validateRequest } from '../../middlewares/validate-request';
import { admin } from '../../middlewares/admin';
import { auth } from '../../middlewares/authenticated';

const router = express.Router();
const createValidator = [
  body('name').notEmpty().withMessage('Name is required'),
];

router.get('/admin/contractor', auth, admin, getContractors);
router.post(
  '/admin/contractor/create',
  auth,
  admin,
  createValidator,
  validateRequest,
  create
);
router.post(
  '/admin/contractor/update/:id',
  auth,
  admin,
  createValidator,
  validateRequest,
  update
);
router.post('/admin/contractor/delete/:id', auth, admin, deleteContractor);

export { router as adminContractorRouter };
