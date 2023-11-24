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
  const admin = await createUser();
  const appointment = Appointment.generate({
    list: list._id,
    user: admin._id,
    date,
    description: 'Appointment Booked',
  });
  await appointment.save();
  return appointment;
};

const userDetails: UserAttrs = {
  firstname: 'Test',
  lastname: 'Admin',
  phone: '0123456789',
  email: 'test@example.com',
  password: 'password',
  role: Roles.USER,
};

const createUser = async () => {
  const admin = User.generate(userDetails);
  await admin.save();
  return admin;
};

describe('admin-appointment-routes', () => {
  it('Admin: Fetches appointments', async () => {
    const cookie = await global.adminLogin();
    const date = new Date(new Date().getTime() + 2 * 86400000); //2 days from now
    await mockAppointment(date);
    const response = await request(app)
      .get('/api/admin/appointments')
      .set('x-access-token', cookie)
      .send()
      .expect(200);
    expect(response.body.length).toBeGreaterThanOrEqual(1);
    expect(new Date(response.body[0].date)).toEqual(date);
  });

  // // /api/admin/appointment/:id
  it('Admin: Fetches single appointment', async () => {
    const cookie = await global.adminLogin();
    const date = new Date(new Date().getTime() + 2 * 86400000); //2 days from now
    const appointment = await mockAppointment(date);
    const response = await request(app)
      .get(`/api/admin/appointment/${appointment._id}`)
      .set('x-access-token', cookie)
      .send()
      .expect(200);
    expect(new Date(response.body.date)).toEqual(date);
  });

  // /api/admin/appointment/create
  it('Admin: Creates appointment', async () => {
    const cookie = await global.adminLogin();
    const listing = await createListing();
    const user = await createUser();
    const date = new Date(new Date().getTime() + 2 * 86400000); //2 days from now
    const data = {
      date,
      list: listing._id,
      description: 'Appointment Booked',
      userId: user._id,
    };
    const response = await request(app)
      .post(`/api/admin/appointment/create`)
      .set('x-access-token', cookie)
      .send(data)
      .expect(201);
    expect(response.body.list).toEqual(listing._id.toString());
  });

  // // /api/admin/appointment/:id/update

  it('Admin: Updates appointment', async () => {
    const cookie = await global.adminLogin();
    const date = new Date(new Date().getTime() + 2 * 86400000); //2 days from now
    const dateUpdated = new Date(new Date().getTime() + 3 * 86400000); //2 days from now
    const appointment = await mockAppointment(date);
    const newDescription = 'Appointment Updated';
    const response = await request(app)
      .post(`/api/admin/appointment/${appointment._id}/update`)
      .set('x-access-token', cookie)
      .send({
        list: appointment.list,
        userId: appointment.user,
        date: dateUpdated,
        description: newDescription,
      })
      .expect(201);

    expect(response.body.description).toEqual(newDescription);
    expect(new Date(response.body.date)).toEqual(dateUpdated);
  });

  it('Admin: Cancels appointment', async () => {
    const cookie = await global.adminLogin();
    const date = new Date(new Date().getTime() + 2 * 86400000); //2 days from now
    const response = await mockAppointment(date);
   await request(app)
      .post(`/api/admin/appointment/${response._id}/cancel`)
      .set('x-access-token', cookie)
      .send()
      .expect(201);
    const appointment = await Appointment.findById(response.id);
    expect(appointment).toEqual(null);
  });
});
