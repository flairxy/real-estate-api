import request from 'supertest';
import { app } from '../../../app';
import { Roles } from '../../../utils/constants';
import { User, UserAttrs } from '../../../models/user';
import { NotFoundError } from '../../../errors/not-found-error';


const userDetails: UserAttrs = {
  firstname: 'Test',
  lastname: 'User',
  phone: '0123456789',
  email: 'test@example.com',
  password: 'password',
};

const createUser = async (role: Roles) => {
  const user = User.generate({ ...userDetails, role });
  await user.save();
  return user;
};

describe('admin-user-routes', () => {
  //current user test
  it('Responds with 200 if current user is admin', async () => {
    const cookie = await global.adminLogin();
    const response = await request(app)
      .get('/api/current-user')
      .set('x-access-token', cookie)
      .send()
      .expect(200);

    const user = await User.findById(response.body.currentUser.id);
    if (user) {
      expect(user.role).toEqual(Roles.ADMIN);
    } else {
      throw new NotFoundError();
    }
  });

  it('Responds with 401 if not authenticated', async () => {
    await request(app).get('/api/current-user').send().expect(401);
  });

  it('Admin: Fetches users', async () => {
    await createUser(Roles.USER);
    const cookie = await global.adminLogin();
    const response = await request(app)
      .get('/api/admin/users')
      .set('x-access-token', cookie)
      .send()
      .expect(200);
    expect(response.body[0].email).toEqual(userDetails.email);
  });

  it('Not Admin: Fails to fetch users', async () => {
    const cookie = await global.login();
    await request(app)
      .get('/api/admin/users')
      .set('x-access-token', cookie)
      .send()
      .expect(401);
  });

  it('Admin: Fetches admins', async () => {
    await createUser(Roles.ADMIN);
    const cookie = await global.adminLogin();
    const response = await request(app)
      .get('/api/admin/users/admin')
      .set('x-access-token', cookie)
      .send()
      .expect(200);
    expect(response.body[0].email).toEqual(userDetails.email);
  });

  it('Not Admin: Fails to fetch admins', async () => {
    const cookie = await global.login();
     await request(app)
      .get('/api/admin/users/admin')
      .set('x-access-token', cookie)
      .send()
      .expect(401);
  });

  it('Admin: Fetches single user', async () => {
    const user = await createUser(Roles.USER);
    const cookie = await global.adminLogin();
    const response = await request(app)
      .get(`/api/admin/user/${user._id}`)
      .set('x-access-token', cookie)
      .send()
      .expect(200);
    expect(response.body.email).toEqual(userDetails.email);
  });

  it('Not Admin: Fails to fetch single user', async () => {
    const user = await createUser(Roles.USER);
    const cookie = await global.login();
    await request(app)
      .get(`/api/admin/user/${user._id}`)
      .set('x-access-token', cookie)
      .send()
      .expect(401);
  });

  it('Admin: Fetches users with email query', async () => {
    const user = await createUser(Roles.USER);
    const cookie = await global.adminLogin();
    const response = await request(app)
      .post('/api/admin/users/filter')
      .set('x-access-token', cookie)
      .send({ email: user.email })
      .expect(200);
    expect(response.body[0].email).toEqual(userDetails.email);
  });

  it('Not Admin: Fails to fetch users with email query', async () => {
    const user = await createUser(Roles.USER);
    const cookie = await global.login();
    await request(app)
      .post('/api/admin/users/filter')
      .set('x-access-token', cookie)
      .send({ email: user.email })
      .expect(401);
  });

  it('Admin: Updates user data', async () => {
    const user = await createUser(Roles.USER);
    const email = 'updated@mail.com';
    const cookie = await global.adminLogin();
    const response = await request(app)
      .post(`/api/admin/users/update/${user._id}`)
      .set('x-access-token', cookie)
      .send({ ...userDetails, email })
      .expect(201);
    expect(response.body.email).toEqual(email);
  });

  it('Not Admin: Fails to update user data', async () => {
    const user = await createUser(Roles.USER);
    const email = 'updated@mail.com';
    const cookie = await global.login();
    await request(app)
      .post(`/api/admin/users/update/${user._id}`)
      .set('x-access-token', cookie)
      .send({ ...userDetails, email })
      .expect(401);
  });

  it('Admin: Sets user to admin', async () => {
    const user = await createUser(Roles.USER);
    const cookie = await global.adminLogin();
    await request(app)
      .post(`/api/admin/users/set-role`)
      .set('x-access-token', cookie)
      .send({ ids: [user._id] })
      .expect(201);
    const updatedUser = await User.findById(user._id);
    if (!updatedUser) throw new NotFoundError();
    expect(updatedUser.role).toEqual(Roles.ADMIN);
  });

  it('Not Admin: Fails to set user to admin', async () => {
    const user = await createUser(Roles.USER);
    const cookie = await global.login();
    await request(app)
      .post(`/api/admin/users/set-role`)
      .set('x-access-token', cookie)
      .send({ ids: [user._id] })
      .expect(401);
  });
  it('Admin: Remove user as admin', async () => {
    const user = await createUser(Roles.ADMIN);
    const cookie = await global.adminLogin();
    await request(app)
      .post(`/api/admin/users/remove-role`)
      .set('x-access-token', cookie)
      .send({ ids: [user._id] })
      .expect(201);
    const updatedUser = await User.findById(user._id);
    if (!updatedUser) throw new NotFoundError();
    expect(updatedUser.role).toEqual(Roles.USER);
  });

  it('Not Admin: Fails to remove user as admin', async () => {
    const user = await createUser(Roles.ADMIN);
    const cookie = await global.login();
    await request(app)
      .post(`/api/admin/users/remove-role`)
      .set('x-access-token', cookie)
      .send({ ids: [user._id] })
      .expect(401);
  });

  it('Admin: Delete User', async () => {
    const user = await createUser(Roles.ADMIN);
    const cookie = await global.adminLogin();
    await request(app)
      .post(`/api/admin/users/delete`)
      .set('x-access-token', cookie)
      .send({ ids: [user._id] })
      .expect(201);
    const deletedUser = await User.findById(user._id);
    expect(deletedUser).toEqual(null);
  });

  it('Not Admin: Fails to delete user', async () => {
    const user = await createUser(Roles.ADMIN);
    const cookie = await global.login();
    await request(app)
      .post(`/api/admin/users/delete`)
      .set('x-access-token', cookie)
      .send({ ids: [user._id] })
      .expect(401);
  });
});
