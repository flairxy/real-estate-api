import express from 'express';
import { body } from 'express-validator';
import {
  getListings,
  create,
  update,
  find,
  deleteListing,
  filter,
  uploadImage,
} from '../../controllers/admin/listing-controller';
import { validateRequest } from '../../middlewares/validate-request';
import { admin } from '../../middlewares/admin';
import { multerUpload } from '../../middlewares/multer';
import { auth } from '../../middlewares/authenticated';

const router = express.Router();
const createValidator = [
  body('description').notEmpty().withMessage('Description is required'),
  body('type').isInt().notEmpty().withMessage('List type is required'),
  body('location').notEmpty().withMessage('Location is required'),
  body('price').isInt().notEmpty().withMessage('Price is required'),
];

router.get('/admin/listing', auth, admin, getListings);
router.get('/admin/listing/:id', auth, admin, find);
router.post('/admin/listing/filter', auth, admin, filter);
router.post(
  '/admin/listing/image-upload/:id',
  auth,
  admin,
  multerUpload.single('image'),
  validateRequest,
  uploadImage
);
router.post(
  '/admin/listing/create',
  auth,
  admin,
  createValidator,
  validateRequest,
  create
);
router.post(
  '/admin/listing/update/:id',
  auth,
  admin,
  createValidator,
  validateRequest,
  update
);
router.post('/admin/listing/delete/:id', auth, admin, deleteListing);

export { router as adminListRouter };
