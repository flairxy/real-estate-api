import { Request, Response } from 'express';
import { Transaction } from '../../models/transaction';
import { BadRequestError } from '../../errors/bad-request-error';
import { PaystackService } from '../../services';
import { ListingStatus, TransactionStatus } from '../../utils/constants';
import { User } from '../../models/user';
import { NotAuthorizedError } from '../../errors/not-authorized-error';
import { Listing } from '../../models/listing';
import { NotFoundError } from '../../errors/not-found-error';
import { UserListing } from '../../models/user-listing';
import { CustomError } from '../../errors/custom-error';
import { randomChars } from '../../utils/password';

const LISTING = 'listing';
export const getListing = async (req: Request, res: Response) => {
  const user = req.currentUser;
  const UserListings = await UserListing.find({ user: user?.id });
  let newListing = [];
  for (let i = 0; i < UserListings.length; i++) {
    const list = await Listing.findById(UserListings[i].listing).populate(
      'images'
    );
    newListing.push(list);
  }
  res.send(newListing);
};

export const getTransactions = async (req: Request, res: Response) => {
  const user = req.currentUser;
  const transactions = await Transaction.find({ user: user?.id });
  res.send(transactions);
};

export const create = async (req: Request, res: Response) => {
  const { id } = req.params;
  const currentUser = req.currentUser;
  if (!currentUser) throw new NotAuthorizedError();
  const user = await User.findById(currentUser.id);
  const listing = await Listing.findById(id);
  if (!user) throw new NotAuthorizedError();
  if (!listing) throw new NotFoundError('Invalid Listing');
  if (listing.locked && user._id !== listing.locked_by)
    throw new BadRequestError('Unable to process request');

  if (listing.price <= 10000000) {
    const response = await PaystackService.initialize(
      user.email,
      listing.price.toString()
    );
    if ((!response && !response.data.reference) || !response.data.access_code)
      throw new BadRequestError('Failed to initiate transaction.');
    const transaction = Transaction.generate({
      list: listing.id,
      user: user.id,
      amount: listing.price,
      reference: response.data.reference,
      code: response.data.access_code,
      status: TransactionStatus.PENDING,
      email: user.email,
    });
    await transaction.save();
    //lock listing
    listing.locked = true;
    listing.locked_at = new Date(Date.now());
    await listing.save();
    res.status(201).send({ url: response.data.authorization_url });
  } else {
    const transaction = Transaction.generate({
      list: listing.id,
      user: user.id,
      amount: listing.price,
      reference: randomChars(9),
      status: TransactionStatus.PENDING,
      email: user.email,
      isTransfer: true,
    });
    await transaction.save();
    //lock listing
    listing.locked = true;
    listing.locked_at = new Date(Date.now());
    await listing.save();
    res.status(201).send('success');
  }
};

export const verify = async (req: Request, res: Response) => {
  const { reference } = req.params;
  const transaction = await Transaction.findOne({ reference });
  if (!transaction)
    throw new BadRequestError('Invalid transaction ID or reference');
  const response = await PaystackService.verifyTransaction(
    transaction.reference
  );
  const paidAmount = response.data.amount / 100;
  if (
    response &&
    response.status === true &&
    paidAmount === transaction.amount &&
    response.data.reference === transaction.reference &&
    response.data.status === 'success'
  ) {
    transaction.status = TransactionStatus.COMPLETED;
    transaction.txId = response.data.id;
    await transaction.save();
    const userListing = await UserListing.findOne({
      user: transaction.user,
      listing: transaction.list,
    });
    const listing = await Listing.findById(transaction.list);
    if (listing) {
      listing.status = ListingStatus.SOLD;
      await listing.save();
    }

    if (!userListing)
      await UserListing.create({
        user: transaction.user,
        transaction: transaction.id,
        listing: transaction.list,
      });
    res.status(201).send({ message: 'Transaction completed successfully' });
  } else {
    throw new BadRequestError(response.data.gateway_response);
  }
};
