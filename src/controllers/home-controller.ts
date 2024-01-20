import { Request, Response } from 'express';
import { Listing } from '../models/listing';
import { ListingStatus, TransactionStatus } from '../utils/constants';
import { Transaction } from '../models/transaction';
import { BadRequestError } from '../errors/bad-request-error';
import { PaystackService } from '../services';
const IMAGES = 'images';

export const getFeaturedListing = async (req: Request, res: Response) => {
  const listings = await Listing.find({
    featured: true,
    locked: false,
    status: ListingStatus.ACTIVE,
  }).populate(IMAGES);
  const sListings = listings.slice(0, 6);
  res.send(sListings);
};

export const getListings = async (req: Request, res: Response) => {
  const { page } = req.query;
  const p = page as any as number;
  const pageSize = 6;
  let startIndex = (p - 1) * pageSize;
  let endIndex = p * pageSize;
  const listings = await Listing.find({
    status: ListingStatus.ACTIVE,
    locked: false,
  }).populate(IMAGES);
  const totalListings = listings.length;
  const paginatedListings = listings.slice(startIndex, endIndex);
  const totalPage = Math.ceil(listings.length / pageSize);
  res.send({
    properties: paginatedListings,
    totalPage,
    totalListings,
  });
};

export const getListing = async (req: Request, res: Response) => {
  const { id } = req.params;
  const listings = await Listing.findById(id).populate(IMAGES);
  res.send(listings);
};

export const verify = async (req: Request, res: Response) => {
  const { id } = req.params;
  const transaction = await Transaction.findById(id);
  if (!transaction)
    throw new BadRequestError('Invalid transaction ID or reference');
  const response = await PaystackService.verifyTransaction(
    transaction.reference
  );

  if (
    response &&
    response.status === true &&
    response.data.amount === transaction.amount &&
    response.data.reference === transaction.reference &&
    response.data.status === 'success'
  ) {
    transaction.status = TransactionStatus.COMPLETED;
    transaction.txId = response.data.id;
    await transaction.save();
    res.status(201).send({ message: 'Transaction completed successfully' });
  } else {
    throw new BadRequestError(response.data.gateway_response);
  }
};
