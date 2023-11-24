import request from 'supertest';
import { app } from '../../../app';
import { Appointment, Properties } from '../../../models/appointment';
import { User, UserAttrs } from '../../../models/user';
import {
  Listing,
  Properties as ListingProperties,
} from '../../../models/listing';
import { Roles, TransactionStatus } from '../../../utils/constants';

const createListing = async () => {
  const listingDetails: ListingProperties = {
    description: 'Description',
    type: 1,
    location: 'Abuja',
    price: 500,
  };

  const list = Listing.generate(listingDetails);
  await list.save();
  return list;
};

const mockAppointment = async (date: Date) => {
  const list = await createListing();
  const user = await createUser();
  const appointment = Appointment.generate({
    list: list._id,
    user: user._id,
    date,
    description: 'Appointment Booked',
  });
  await appointment.save();
  return appointment;
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

describe('user-appointment-routes', () => {
  it('User: Fetches appointments', async () => {
    const cookie = await global.login();
    const date = new Date(new Date().getTime() + 2 * 86400000); //2 days from now
    await mockAppointment(date);
    const response = await request(app)
      .get('/api/user/appointments')
      .set('x-access-token', cookie)
      .send()
      .expect(200);
    expect(response.body.length).toBeGreaterThanOrEqual(1);
    expect(new Date(response.body[0].date)).toEqual(date);
  });

  // // /api/user/appointment/:id
  it('User: Fetches single appointment', async () => {
    const cookie = await global.login();
    const date = new Date(new Date().getTime() + 2 * 86400000); //2 days from now
    const appointment = await mockAppointment(date);
    const response = await request(app)
      .get(`/api/user/appointment/${appointment._id}`)
      .set('x-access-token', cookie)
      .send()
      .expect(200);
    expect(new Date(response.body.date)).toEqual(date);
  });

  // /api/user/appointment/create
  it('User: Creates appointment', async () => {
    const cookie = await global.login();
    const listing = await createListing();
    const date = new Date(new Date().getTime() + 2 * 86400000); //2 days from now
    const data = {
      date,
      list: listing._id,
      description: 'Appointment Booked',
    };
    const response = await request(app)
      .post(`/api/user/appointment/create`)
      .set('x-access-token', cookie)
      .send(data)
      .expect(201);
    expect(response.body.list).toEqual(listing._id.toString());
  });

  // // /api/user/transaction/:id/update

  it('User: Updates appointment', async () => {
    const cookie = await global.login();
    const listing = await createListing();
    const date = new Date(new Date().getTime() + 2 * 86400000); //2 days from now
    const dateUpdated = new Date(new Date().getTime() + 3 * 86400000); //2 days from now
    const data = {
      date,
      list: listing._id,
      description: 'Appointment Booked',
    };
    const newDescription = 'Appointment Updated';
    const response = await request(app)
      .post(`/api/user/appointment/create`)
      .set('x-access-token', cookie)
      .send(data)
      .expect(201);

    const updated = await request(app)
      .post(`/api/user/appointment/${response.body.id}/update`)
      .set('x-access-token', cookie)
      .send({ ...data, description: newDescription, date: dateUpdated })
      .expect(201);
    expect(updated.body.description).toEqual(newDescription);
    expect(new Date(updated.body.date)).toEqual(dateUpdated);
  });
  it('User: Cancels appointment', async () => {
    const cookie = await global.login();
    const listing = await createListing();
    const date = new Date(new Date().getTime() + 2 * 86400000); //2 days from now
    const data = {
      date,
      list: listing._id,
      description: 'Appointment Booked',
    };
    const response = await request(app)
      .post(`/api/user/appointment/create`)
      .set('x-access-token', cookie)
      .send(data)
      .expect(201);

     await request(app)
      .post(`/api/user/appointment/${response.body.id}/cancel`)
      .set('x-access-token', cookie)
      .send()
      .expect(201);
      const appointment = await Appointment.findById(response.body.id);
    expect(appointment).toEqual(null);
  });
});
