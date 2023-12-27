import express from 'express';
import { getFeaturedListing, getListing, getListings } from '../../controllers/home-controller';

const router = express.Router();

router.get('/listing/featured', getFeaturedListing);
router.get('/listing/:id', getListing);
router.get('/listings', getListings);

export { router as homeRouter };
