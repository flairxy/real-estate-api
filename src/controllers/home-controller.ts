import { Request, Response } from 'express';
import { Listing } from '../models/listing';
import { ListingStatus } from '../utils/constants';
const IMAGES = 'images';

export const getFeaturedListing = async (req: Request, res: Response) => {
  const listings = await Listing.find({
    featured: true,
    status: ListingStatus.ACTIVE,
  }).populate(IMAGES);
  res.send(listings);
};

export const getListing = async (req: Request, res: Response) => {
  const { id } = req.params;
  const listings = await Listing.findById(id).populate(IMAGES);
  res.send(listings);
};
