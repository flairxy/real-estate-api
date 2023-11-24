import request from 'supertest';
import { app } from '../../../app';

const userDetails = {
  firstname: 'Test',
  lastname: 'User',
  phone: '0123456789',
  email: 'user@example.com',
  password: 'password',
};

//current user test
it('responds with details about the current user', async () => {
  const cookie = await global.login(); //got the test/setup.ts file and see where we define the gloabl.signin

  const response = await request(app)
    .get('/api/current-user')
    .set('x-access-token', cookie)
    .send()
    .expect(200);

  expect(response.body.currentUser.email).toEqual(userDetails.email);
});

it('responds with 401 if not authenticated', async () => {
  await request(app)
    .get('/api/current-user')
    .send()
    .expect(401);
  
});

//Login test

it("fails when an email that doesn't exist is supplied", async () => {
  await request(app)
    .post('/api/login')
    .send({ email: userDetails.email, password: userDetails.password })
    .expect(400);
});

it('fails when an invalid password is supplied', async () => {
  await request(app).post('/api/register').send(userDetails).expect(201);

  await request(app)
    .post('/api/login')
    .send({ email: userDetails.email, password: 'passwordx' })
    .expect(400);
});

it('responds with a cookie when given valid credentials', async () => {
  await request(app).post('/api/register').send(userDetails).expect(201);

  const response = await request(app)
    .post('/api/login')
    .send({ email: userDetails.email, password: 'password' })
    .expect(200);

  expect(response.body.token).toBeDefined();
});

//Registration test

it('returns a 201 on successful registration', async () => {
  return request(app).post('/api/register').send(userDetails).expect(201);
});

it('returns a 400 with an invalid email', async () => {
  await request(app)
    .post('/api/register')
    .send({ ...userDetails, email: 'user.example.com' })
    .expect(400);
});

it('reurns a 400 with an invalid password', async () => {
  await request(app)
    .post('/api/register')
    .send({ ...userDetails, password: 'pa' })
    .expect(400);
});

it('reurns a 400 with missing firstname, lastname, phone, email or password', async () => {
  await request(app)
    .post('/api/register')
    .send({ ...userDetails, firstname: '' })
    .expect(400);

  await request(app)
    .post('/api/register')
    .send({ ...userDetails, lastname: '' })
    .expect(400);

  await request(app)
    .post('/api/register')
    .send({ ...userDetails, phone: '' })
    .expect(400);

    await request(app)
    .post('/api/register')
    .send({ ...userDetails, email: '' })
    .expect(400);

    await request(app)
    .post('/api/register')
    .send({ ...userDetails, password: '' })
    .expect(400);
});

it('disallows duplicate emails', async () => {
  await request(app)
    .post('/api/register')
    .send(userDetails)
    .expect(201);

  await request(app)
    .post('/api/register')
    .send(userDetails)
    .expect(400);
});

it('sets a cookies after successful registration', async () => {
  await request(app)
    .post('/api/register')
    .send(userDetails)
    .expect(201);
});

//Logout test
it('clears the cookie after logout', async () => {
  await request(app)
    .post('/api/register')
    .send(userDetails)
    .expect(201);

  const response = await request(app)
    .post('/api/logout')
    .send({})
    .expect(200);
  // expect(response.get('Set-Cookie')[0]).toBeDefined();
  expect(response.get('Set-Cookie')[0]).toEqual(
    'session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; httponly'
  );
});
