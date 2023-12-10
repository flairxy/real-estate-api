import request from 'supertest';
import { app } from '../../../app';
import { Transaction, Properties } from '../../../models/transaction';
import { User, UserAttrs } from '../../../models/user';
import {
  Listing,
  Properties as ListingProperties,
} from '../../../models/listing';
import { Roles, TransactionStatus } from '../../../utils/constants';

const createListing = async () => {
  const listingDetails: ListingProperties = {
    title: 'Title',
    description: 'Description',
    type: 1,
    category: 1,
    location: 'Abuja',
    price: 500,
  };

  const list = Listing.generate(listingDetails);
  await list.save();
  return list;
};

const mockTransactions = async (data: Properties) => {
  const transaction = Transaction.generate(data);
  await transaction.save();
  return transaction;
};

const userDetails: UserAttrs = {
  firstname: 'Test',
  lastname: 'User',
  phone: '0123456789',
  email: 'test@example.com',
  password: 'password',
  role: Roles.USER,
};

const createUser = async () => {
  const user = User.generate(userDetails);
  await user.save();
  return user;
};

describe('admin-transaction-routes', () => {
  it('Admin: Fetches transactions', async () => {
    const cookie = await global.adminLogin();
    const listing = await createListing();
    const user = await createUser();
    const data: Properties = {
      code: 'testcode',
      reference: 'reference',
      amount: 1000,
      list: listing._id,
      user: user._id,
    };
    //create transaction
    const transactionResponse = await mockTransactions(data);
    const response = await request(app)
      .get('/api/admin/transactions')
      .set('x-access-token', cookie)
      .send()
      .expect(200);
    expect(response.body.length).toBeGreaterThanOrEqual(1);
    expect(response.body[0].list.id).toEqual(listing.id);
    expect(response.body[0].reference).toEqual(transactionResponse.reference);
  }, 10000);

  // /api/admin/transaction/:id
  it('Admin: Fetches single listing', async () => {
    const cookie = await global.adminLogin();
    const listing = await createListing();
    const user = await createUser();
    const data: Properties = {
      code: 'testcode',
      reference: 'reference',
      amount: 1000,
      list: listing._id,
      user: user._id,
    };
    //create transaction
    const transactionResponse = await mockTransactions(data);
    const response = await request(app)
      .get(`/api/admin/transaction/${transactionResponse._id}`)
      .set('x-access-token', cookie)
      .send()
      .expect(200);
    expect(response.body.list.id).toEqual(listing.id);
    expect(response.body.reference).toEqual(transactionResponse.reference);
  });
  // /api/admin/transaction/:id/complete
  it('Admin: Marks transaction as complete', async () => {
    const cookie = await global.adminLogin();
    const listing = await createListing();
    const user = await createUser();
    const data: Properties = {
      code: 'testcode',
      reference: 'reference',
      amount: 1000,
      list: listing._id,
      user: user._id,
    };
    //create transaction
    const transactionResponse = await mockTransactions(data);
    expect(transactionResponse.status).toEqual(TransactionStatus.PENDING);
    const response = await request(app)
      .post(`/api/admin/transaction/${transactionResponse._id}/complete`)
      .set('x-access-token', cookie)
      .send()
      .expect(201);
      expect(response.body.status).toEqual(TransactionStatus.COMPLETED);
  });
  // /api/admin/transaction/:id/pending
  it('Admin: Marks transaction as pending', async () => {
    const cookie = await global.adminLogin();
    const listing = await createListing();
    const user = await createUser();
    const data: Properties = {
      code: 'testcode',
      reference: 'reference',
      amount: 1000,
      list: listing._id,
      user: user._id,
      status: TransactionStatus.COMPLETED
    };
    //create transaction
    const transactionResponse = await mockTransactions(data);
    expect(transactionResponse.status).toEqual(TransactionStatus.COMPLETED);
    const response = await request(app)
      .post(`/api/admin/transaction/${transactionResponse._id}/pending`)
      .set('x-access-token', cookie)
      .send()
      .expect(201);
      expect(response.body.status).toEqual(TransactionStatus.PENDING);
  });
  // /api/admin/transactions/delete
  it('Admin: Deletes transaction', async () => {
    const cookie = await global.adminLogin();
    const listing = await createListing();
    const user = await createUser();
    const data: Properties = {
      code: 'testcode',
      reference: 'reference',
      amount: 1000,
      list: listing._id,
      user: user._id,
      status: TransactionStatus.PENDING
    };
    //create transaction
    const transactionResponse = await mockTransactions(data);
    await request(app)
      .post(`/api/admin/transactions/delete`)
      .set('x-access-token', cookie)
      .send({
        ids: [transactionResponse._id]
      })
      .expect(201);
      const transaction = await Transaction.findById(transactionResponse.id);
      expect(transaction).toEqual(null);
  });
  
})