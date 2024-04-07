import express from 'express';
import { body } from 'express-validator';
import {
  getBlogs,
  create,
  update,
  find,
  deleteBlog,
  filter,
  uploadResource,
  deleteResource
} from '../../controllers/admin/blog-controller';
import { validateRequest } from '../../middlewares/validate-request';
import { admin } from '../../middlewares/admin';
import { multerUpload } from '../../middlewares/multer';
import { auth } from '../../middlewares/authenticated';

const router = express.Router();
const createValidator = [
  body('title').notEmpty().withMessage('Title is required'),
  body('body').notEmpty().withMessage('Address is required'),
];

router.get('/admin/blog', auth, admin, getBlogs);
router.get('/admin/blog/:id', auth, admin, find);
router.post('/admin/blog/filter', auth, admin, filter);
router.post(
  '/admin/blog/resource-upload/:id',
  auth,
  admin,
  multerUpload.single('file'),
  validateRequest,
  uploadResource
);
router.post(
  '/admin/blog/create',
  auth,
  admin,
  createValidator,
  validateRequest,
  create
);
router.post(
  '/admin/blog/update/:id',
  auth,
  admin,
  createValidator,
  validateRequest,
  update
);
router.post('/admin/blog/delete/:id', auth, admin, deleteBlog);
router.post('/admin/blog/resource/delete', auth, admin, deleteResource);

export { router as adminBlogRouter };
