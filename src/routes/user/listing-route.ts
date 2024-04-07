import express from 'express';
import { getFeaturedListing, getListing, getListings, getBlogs, getBlog } from '../../controllers/home-controller';

const router = express.Router();

router.get('/listing/featured', getFeaturedListing);
router.get('/listing/:id', getListing);
router.get('/listings', getListings);

router.get('/blog/:id', getBlog);
router.get('/blogs', getBlogs);

export { router as homeRouter };
