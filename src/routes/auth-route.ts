import express from 'express';
import { body } from 'express-validator';
import {
  register,
  login,
  logout,
  authUser,
  updatePassword,
  resetPassword,
  resetToken,
  verifyEmail,
  refreshLink
} from '../controllers/auth/auth-controller';
import { validateRequest } from '../middlewares/validate-request';
import { auth } from '../middlewares/authenticated';

const router = express.Router();
const registerValidator = [
  body('email').isEmail().withMessage('Email must be valid'),
  body('phone').notEmpty().withMessage('Phone is required'),
  body('firstname').notEmpty().withMessage('Firstname is required'),
  body('lastname').notEmpty().withMessage('Lastname is required'),
  body('password')
    .trim()
    .isLength({ min: 4, max: 20 })
    .withMessage('Password must be between 4 and 20 characters'),
];

const loginValidator = [
  body('email').isEmail().withMessage('Email must be valid'),
  body('password').trim().notEmpty().withMessage('Password is required'),
];

const passwordValidor = [
  body('password').trim().notEmpty().withMessage('Password is required'),
  body('oldPassword').trim().notEmpty().withMessage('Old password is required'),
];

router.get('/', (req, res) => {
  res.send('API Running...');
});
router.get('/current-user', auth, authUser);
router.post('/register', registerValidator, validateRequest, register);
router.post('/login', loginValidator, validateRequest, login);
router.post(
  '/reset-token',
  [body('email').isEmail().withMessage('Email must be valid')],
  validateRequest,
  resetToken
);
router.post(
  '/:token/reset-password',
  [body('password').trim().notEmpty().withMessage('Password is required')],
  validateRequest,
  resetPassword
);
router.post(
  '/update-password',
  passwordValidor,
  validateRequest,
  auth,
  updatePassword
);
router.post('/logout', logout);
router.post('/verification/refresh', auth, refreshLink);
router.post('/email/verify/:token', auth, verifyEmail);

export { router as authRouter };
