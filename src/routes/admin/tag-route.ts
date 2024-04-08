import express from 'express';
import { body } from 'express-validator';
import {
  getTags, create, update, deleteTag
} from '../../controllers/admin/tag-controller';
import { validateRequest } from '../../middlewares/validate-request';
import { admin } from '../../middlewares/admin';
import { auth } from '../../middlewares/authenticated';

const router = express.Router();
const createValidator = [
  body('name').notEmpty().withMessage('Name is required'),
];

router.get('/admin/tag', auth, admin, getTags);
router.post(
  '/admin/tag/create',
  auth,
  admin,
  createValidator,
  validateRequest,
  create
);
router.post(
  '/admin/tag/update/:id',
  auth,
  admin,
  createValidator,
  validateRequest,
  update
);
router.post('/admin/tag/delete/:id', auth, admin, deleteTag);

export { router as adminTagRouter };
