import { Request, Response } from 'express';
import { Transaction } from '../../models/transaction';
import { BadRequestError } from '../../errors/bad-request-error';
import { PaystackService } from '../../services';
import { TransactionStatus } from '../../utils/constants';
import { User } from '../../models/user';
import { NotAuthorizedError } from '../../errors/not-authorized-error';
import { Listing } from '../../models/listing';
import { NotFoundError } from '../../errors/not-found-error';

export const create = async (req: Request, res: Response) => {
  const { id } = req.params;
  const currentUser = req.currentUser;
  if (!currentUser) throw new NotAuthorizedError();
  const user = await User.findById(currentUser.id);
  const listing = await Listing.findById(id);
  if (!user) throw new NotAuthorizedError();
  if (!listing) throw new NotFoundError('Invalid Listing');
  const response = await PaystackService.initialize(
    user.email,
    listing.price.toString()
  );
  if (!response || !response.data.referrence || !response.data.access_code)
    throw new BadRequestError('Failed to initiate transaction.');
  const transaction = Transaction.generate({
    list: listing.id,
    user: user.id,
    amount: listing.price,
    reference: response.data.reference,
    code: response.data.access_code,
    status: TransactionStatus.PENDING,
    email: user.email
  });
  await transaction.save();
  res.status(201).send(transaction);
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
