import request from 'supertest';
import { app } from '../../../app';
import { Listing, Properties } from '../../../models/listing';

const listingDetails: Properties = {
  description: 'Description',
  type: 1,
  location: 'Abuja',
  price: 500,
};

const createListing = async () => {
  const listing = Listing.generate(listingDetails);
  await listing.save();
  return listing;
};

describe('admin-listing-routes', () => {
  it('Admin: Fetches listing', async () => {
    await createListing();
    const cookie = await global.adminLogin();
    const response = await request(app)
      .get('/api/admin/listing')
      .set('x-access-token', cookie)
      .send()
      .expect(200);
    expect(response.body[0].location).toEqual(listingDetails.location);
  });

  it('Not Admin: Fails to fetch listing', async () => {
    const cookie = await global.login();
    await request(app)
      .get('/api/admin/listing')
      .set('x-access-token', cookie)
      .send()
      .expect(401);
    
  });

  it('Admin: Fetches single listing', async () => {
    const listing = await createListing();
    const cookie = await global.adminLogin();
    const response = await request(app)
      .get(`/api/admin/listing/${listing._id}`)
      .set('x-access-token', cookie)
      .send()
      .expect(200);
    expect(response.body.description).toEqual(listingDetails.description);
    expect(response.body.location).toEqual(listingDetails.location);
  });

  it('Not Admin: Fails to fetch single listing', async () => {
    const listing = await createListing();
    const cookie = await global.login();
    await request(app)
      .get(`/api/admin/listing/${listing._id}`)
      .set('x-access-token', cookie)
      .send()
      .expect(401);
    
  });

  it('Admin: Fetches listing with price query', async () => {
    await createListing();
    const cookie = await global.adminLogin();
    const response = await request(app)
      .post('/api/admin/listing/filter')
      .set('x-access-token', cookie)
      .send({ price: 500, location: '' })
      .expect(200);
    expect(response.body[0].location).toEqual(listingDetails.location);
    expect(response.body[0].description).toEqual(listingDetails.description);
  });

  it('Admin: Fetches listing with location query', async () => {
    await createListing();
    const cookie = await global.adminLogin();
    const response = await request(app)
      .post('/api/admin/listing/filter')
      .set('x-access-token', cookie)
      .send({ location: 'Abuja' })
      .expect(200);
    expect(response.body[0].location).toEqual(listingDetails.location);
    expect(response.body[0].description).toEqual(listingDetails.description);
  });

  it('Not Admin: Fails to fetch listing with query', async () => {
    await createListing();
    const cookie = await global.login();
    await request(app)
      .post('/api/admin/listing/filter')
      .set('x-access-token', cookie)
      .send({ price: 500 })
      .expect(401);
    
  });

  // it('Admin: Uploads listing images', async () => {
  //   const listing = await createListing();
  //   const cookie = await global.adminLogin();
  //   const file = fs.readFileSync(`${__dirname}/file.png`);
  //   const response = await request(app)
  //   .post(`/api/admin/listing/image-upload/${listing._id}`)
  //   .set('x-access-token', cookie)
  //   .set('content-type', 'multipart/form-data')
  //   .attach('image', file)
  //     .expect(201);
  //   const updatedListing = response.body;
  //   if (!updatedListing) throw new NotFoundError();
  //   expect(updatedListing.images.length).toEqual(1);

  //   //delete listing
  //   await request(app)
  //     .post(`/api/admin/listing/delete/${updatedListing.id}`)
  //     .set('x-access-token', cookie)
  //     .send()
  //     .expect(200);
  //   const upload = await Upload.findById(updatedListing.images[0]);
  //   expect(upload).toEqual(null);
  //   const deletedListing = await Listing.findById(updatedListing.id);
  //   expect(deletedListing).toEqual(null);
  // }, 10000);

  // it('Not Admin: fails to upload', async () => {
  //   const listing = await createListing();
  //   const cookie = await global.login();
  //   const file = fs.readFileSync(`${__dirname}/file.png`);
  //   const response = await request(app)
  //     .post(`/api/admin/listing/image-upload/${listing._id}`)
  //     .set('x-access-token', cookie)
  //     .set('content-type', 'multipart/form-data')
  //     .send({image: file})
  //     .expect(401);
  //   
  // });

  it('Admin: Creates listing', async () => {
    const cookie = await global.adminLogin();
    const response = await request(app)
      .post(`/api/admin/listing/create`)
      .set('x-access-token', cookie)
      .send(listingDetails)
      .expect(201);
    expect(response.body.description).toEqual(listingDetails.description);
    expect(response.body.location).toEqual(listingDetails.location);
  });

  it('Not Admin: Fails to create listing', async () => {
    const cookie = await global.login();
    await request(app)
      .post(`/api/admin/listing/create`)
      .set('x-access-token', cookie)
      .send(listingDetails)
      .expect(401);
    
  });

  it('Admin: Updates listing data', async () => {
    const listing = await createListing();
    const location = 'Lagos';
    const cookie = await global.adminLogin();
    const response = await request(app)
      .post(`/api/admin/listing/update/${listing._id}`)
      .set('x-access-token', cookie)
      .send({ ...listingDetails, location })
      .expect(201);
    expect(response.body.description).toEqual(listingDetails.description);
    expect(response.body.location).toEqual(location);
  });

  it('Not Admin: Fails to update listing data', async () => {
    const listing = await createListing();
    const location = 'Lagos';
    const cookie = await global.login();
    await request(app)
      .post(`/api/admin/listing/update/${listing._id}`)
      .set('x-access-token', cookie)
      .send({ ...listingDetails, location })
      .expect(401);
    
  });

  it('Admin: Delete Listing', async () => {
    const listing = await createListing();
    const cookie = await global.adminLogin();
    await request(app)
      .post(`/api/admin/listing/delete/${listing._id}`)
      .set('x-access-token', cookie)
      .send()
      .expect(201);
    const deletedListing = await Listing.findById(listing._id);
    expect(deletedListing).toEqual(null);
  });

  it('Not Admin: Fails to delete listing', async () => {
    const listing = await createListing();
    const cookie = await global.login();
    await request(app)
      .post(`/api/admin/listing/delete/${listing._id}`)
      .set('x-access-token', cookie)
      .send()
      .expect(401);
    
  });
});
