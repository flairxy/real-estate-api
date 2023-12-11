import express from 'express';
import { getFeaturedListing, getListing } from '../../controllers/home-controller';

const router = express.Router();

router.get('/listing/featured', getFeaturedListing);
router.get('/listing/:id', getListing);

export { router as homeRouter };
