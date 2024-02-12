import express from 'express';
import { getFeaturedListing, getListing, getListings, getContractors } from '../../controllers/home-controller';

const router = express.Router();

router.get('/listing/featured', getFeaturedListing);
router.get('/listing/:id', getListing);
router.get('/listings', getListings);
router.get('/contractors', getContractors);

export { router as homeRouter };
