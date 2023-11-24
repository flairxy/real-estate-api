import express from 'express';
import {
  getAppointments,
  create,
  update,
  find,
  cancelAppointment,
} from '../../controllers/user/appointment-controller';
import { body } from 'express-validator';
import { validateRequest } from '../../middlewares/validate-request';
import { auth } from '../../middlewares/authenticated';

const router = express.Router();

const validator = [
  body('list').notEmpty().withMessage('List is required'),
  body('date').notEmpty().withMessage('Date is required'),
];
router.get(
  '/user/appointments',
  auth,
  getAppointments
);
router.get(
  '/user/appointment/:id',
  auth,
  find
);
router.post(
  '/user/appointment/create',
  auth,
  validator,
  validateRequest,
  create
);
router.post(
  '/user/appointment/:id/update',
  auth,
  validator,
  validateRequest,
  update
);
router.post(
  '/user/appointment/:id/cancel',
  auth,
  cancelAppointment
);

export { router as userAppointmentRouter };
