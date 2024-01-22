import express from 'express';
import { body } from 'express-validator';
import {
  getListings,
  create,
  update,
  find,
  deleteListing,
  filter,
  uploadResource,
  deleteResource,
  updateFeaturedStatus,
  setImageUrl
} from '../../controllers/admin/listing-controller';
import { validateRequest } from '../../middlewares/validate-request';
import { admin } from '../../middlewares/admin';
import { multerUpload } from '../../middlewares/multer';
import { auth } from '../../middlewares/authenticated';

const router = express.Router();
const createValidator = [
  body('title').notEmpty().withMessage('Title is required'),
  body('address').notEmpty().withMessage('Address is required'),
  body('country').notEmpty().withMessage('Country is required'),
  body('state').notEmpty().withMessage('State is required'),
  body('description').notEmpty().withMessage('Description is required'),
  body('category').notEmpty().withMessage('Category is required'),
  body('type').isInt().notEmpty().withMessage('List type is required'),
  body('status').isInt().notEmpty().withMessage('Status type is required'),
  body('price').isInt().notEmpty().withMessage('Price is required'),
];

router.get('/admin/listing', auth, admin, getListings);
router.get('/admin/listing/:id', auth, admin, find);
router.post('/admin/listing/filter', auth, admin, filter);
router.post(
  '/admin/listing/resource-upload/:id',
  auth,
  admin,
  multerUpload.single('file'),
  validateRequest,
  uploadResource
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
router.post('/admin/listing/resource/delete', auth, admin, deleteResource);
router.post('/admin/listing/featured/:id', auth, admin, updateFeaturedStatus);
router.post('/admin/listing/image/:id', auth, admin, setImageUrl);

export { router as adminListRouter };
