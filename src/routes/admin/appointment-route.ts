import express from 'express';
import {
  getAppointments,
  create,
  update,
  find,
  deleteAppointment,
} from '../../controllers/admin/appointment-controller';
import { body } from 'express-validator';
import { validateRequest } from '../../middlewares/validate-request';
import { admin } from '../../middlewares/admin';
import { auth } from '../../middlewares/authenticated';

const router = express.Router();

const validator = [
  body('list').notEmpty().withMessage('List is required'),
  body('date').notEmpty().withMessage('Date is required'),
];
router.get(
  '/admin/appointments',
  auth,
  admin,
  getAppointments
);
router.get(
  '/admin/appointment/:id',
  auth,
  admin,
  find
);
router.post(
  '/admin/appointment/create',
  auth,
  admin,
  validator,
  validateRequest,
  create
);
router.post(
  '/admin/appointment/:id/update',
  auth,
  admin,
  validator,
  validateRequest,
  update
);
router.post(
  '/admin/appointment/:id/cancel',
  auth,
  admin,
  deleteAppointment
);

export { router as adminAppointmentRouter };
