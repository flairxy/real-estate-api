import { Request, Response } from 'express';
import { BadRequestError } from '../../errors/bad-request-error';
import { Transaction } from '../../models/transaction';
import { TransactionStatus } from '../../utils/constants';
import { NotFoundError } from '../../errors/not-found-error';
import { PaystackService } from '../../services';

const USER = 'user';
const LISTING = 'list';

export const getTransactions = async (req: Request, res: Response) => {
  const transactions = await Transaction.find({}).populate([USER, LISTING]);
  res.send(transactions);
};

export const find = async (req: Request, res: Response) => {
  const { id } = req.params;
  const transaction = await Transaction.findById(id).populate([USER, LISTING]);
  res.send(transaction);
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

export const markAsCompleted = async (req: Request, res: Response) => {
  const { id } = req.params;
  const transaction = await Transaction.findById(id);
  if (!transaction) throw new NotFoundError();
  transaction.status = TransactionStatus.COMPLETED;
  await transaction.save();
  res.status(201).send(transaction);
};

export const markAsPending = async (req: Request, res: Response) => {
  const { id } = req.params;
  const transaction = await Transaction.findById(id);
  if (!transaction) throw new NotFoundError();
  transaction.status = TransactionStatus.PENDING;
  await transaction.save();
  res.status(201).send(transaction);
};

export const deleteTransactions = async (req: Request, res: Response) => {
  const { ids } = req.body;
  await Transaction.updateMany(
    { _id: ids },
    {
      isDeleted: true,
    }
  );
  res.status(201).send({ message: 'Deleted Successfully' });
};

export const filter = async (req: Request, res: Response) => {
  const { status } = req.body;
  const transactions = await Transaction.find({ status }).populate([
    USER,
    LISTING,
  ]);
  res.send(transactions);
};
