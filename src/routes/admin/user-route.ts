import express from 'express';
import { body } from 'express-validator';
import {
  getUsers,
  getAdminUsers,
  find,
  update,
  setAdmin,
  removeAdmin,
  deleteUsers,
  filter,
} from '../../controllers/admin/user-controller';
import { validateRequest } from '../../middlewares/validate-request';
import { admin } from '../../middlewares/admin';
import { auth } from '../../middlewares/authenticated';

const router = express.Router();


const validator = [
  body('email').isEmail().withMessage('Email must be valid'),
  body('phone').notEmpty().withMessage('Phone is required'),
  body('firstname').notEmpty().withMessage('Firstname is required'),
  body('lastname').notEmpty().withMessage('Lastname is required'),
];

router.get('/admin/users', auth, admin, getUsers);
router.get('/admin/users/admin', auth, admin, getAdminUsers);
router.get('/admin/user/:id', auth, admin, find);
router.post('/admin/users/filter', auth, admin, filter);
router.post(
  '/admin/users/update/:id',
  validator,
  validateRequest,
  auth,
  admin,
  update
);
router.post('/admin/users/set-role', auth, admin, setAdmin);
router.post('/admin/users/remove-role', auth, admin, removeAdmin);
router.post('/admin/users/delete', auth, admin, deleteUsers);

export { router as adminUserRouter };
