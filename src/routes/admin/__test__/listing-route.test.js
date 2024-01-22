"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
const app_1 = require("../../../app");
const listing_1 = require("../../../models/listing");
const listingDetails = {
    title: 'Title',
    description: 'Description',
    type: 1,
    category: 1,
    location: 'Abuja',
    price: 500,
};
const createListing = () => __awaiter(void 0, void 0, void 0, function* () {
    const listing = listing_1.Listing.generate(listingDetails);
    yield listing.save();
    return listing;
});
describe('admin-listing-routes', () => {
    it('Admin: Fetches listing', () => __awaiter(void 0, void 0, void 0, function* () {
        yield createListing();
        const cookie = yield global.adminLogin();
        const response = yield (0, supertest_1.default)(app_1.app)
            .get('/api/admin/listing')
            .set('x-access-token', cookie)
            .send()
            .expect(200);
        expect(response.body[0].location).toEqual(listingDetails.location);
    }));
    it('Not Admin: Fails to fetch listing', () => __awaiter(void 0, void 0, void 0, function* () {
        const cookie = yield global.login();
        yield (0, supertest_1.default)(app_1.app)
            .get('/api/admin/listing')
            .set('x-access-token', cookie)
            .send()
            .expect(401);
    }));
    it('Admin: Fetches single listing', () => __awaiter(void 0, void 0, void 0, function* () {
        const listing = yield createListing();
        const cookie = yield global.adminLogin();
        const response = yield (0, supertest_1.default)(app_1.app)
            .get(`/api/admin/listing/${listing._id}`)
            .set('x-access-token', cookie)
            .send()
            .expect(200);
        expect(response.body.description).toEqual(listingDetails.description);
        expect(response.body.location).toEqual(listingDetails.location);
    }));
    it('Not Admin: Fails to fetch single listing', () => __awaiter(void 0, void 0, void 0, function* () {
        const listing = yield createListing();
        const cookie = yield global.login();
        yield (0, supertest_1.default)(app_1.app)
            .get(`/api/admin/listing/${listing._id}`)
            .set('x-access-token', cookie)
            .send()
            .expect(401);
    }));
    it('Admin: Fetches listing with price query', () => __awaiter(void 0, void 0, void 0, function* () {
        yield createListing();
        const cookie = yield global.adminLogin();
        const response = yield (0, supertest_1.default)(app_1.app)
            .post('/api/admin/listing/filter')
            .set('x-access-token', cookie)
            .send({ price: 500, location: '' })
            .expect(200);
        expect(response.body[0].location).toEqual(listingDetails.location);
        expect(response.body[0].description).toEqual(listingDetails.description);
    }));
    it('Admin: Fetches listing with location query', () => __awaiter(void 0, void 0, void 0, function* () {
        yield createListing();
        const cookie = yield global.adminLogin();
        const response = yield (0, supertest_1.default)(app_1.app)
            .post('/api/admin/listing/filter')
            .set('x-access-token', cookie)
            .send({ location: 'Abuja' })
            .expect(200);
        expect(response.body[0].location).toEqual(listingDetails.location);
        expect(response.body[0].description).toEqual(listingDetails.description);
    }));
    it('Not Admin: Fails to fetch listing with query', () => __awaiter(void 0, void 0, void 0, function* () {
        yield createListing();
        const cookie = yield global.login();
        yield (0, supertest_1.default)(app_1.app)
            .post('/api/admin/listing/filter')
            .set('x-access-token', cookie)
            .send({ price: 500 })
            .expect(401);
    }));
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
    it('Admin: Creates listing', () => __awaiter(void 0, void 0, void 0, function* () {
        const cookie = yield global.adminLogin();
        const response = yield (0, supertest_1.default)(app_1.app)
            .post(`/api/admin/listing/create`)
            .set('x-access-token', cookie)
            .send(listingDetails)
            .expect(201);
        expect(response.body.description).toEqual(listingDetails.description);
        expect(response.body.location).toEqual(listingDetails.location);
    }));
    it('Not Admin: Fails to create listing', () => __awaiter(void 0, void 0, void 0, function* () {
        const cookie = yield global.login();
        yield (0, supertest_1.default)(app_1.app)
            .post(`/api/admin/listing/create`)
            .set('x-access-token', cookie)
            .send(listingDetails)
            .expect(401);
    }));
    it('Admin: Updates listing data', () => __awaiter(void 0, void 0, void 0, function* () {
        const listing = yield createListing();
        const location = 'Lagos';
        const cookie = yield global.adminLogin();
        const response = yield (0, supertest_1.default)(app_1.app)
            .post(`/api/admin/listing/update/${listing._id}`)
            .set('x-access-token', cookie)
            .send(Object.assign(Object.assign({}, listingDetails), { location }))
            .expect(201);
        expect(response.body.description).toEqual(listingDetails.description);
        expect(response.body.location).toEqual(location);
    }));
    it('Not Admin: Fails to update listing data', () => __awaiter(void 0, void 0, void 0, function* () {
        const listing = yield createListing();
        const location = 'Lagos';
        const cookie = yield global.login();
        yield (0, supertest_1.default)(app_1.app)
            .post(`/api/admin/listing/update/${listing._id}`)
            .set('x-access-token', cookie)
            .send(Object.assign(Object.assign({}, listingDetails), { location }))
            .expect(401);
    }));
    it('Admin: Delete Listing', () => __awaiter(void 0, void 0, void 0, function* () {
        const listing = yield createListing();
        const cookie = yield global.adminLogin();
        yield (0, supertest_1.default)(app_1.app)
            .post(`/api/admin/listing/delete/${listing._id}`)
            .set('x-access-token', cookie)
            .send()
            .expect(201);
        const deletedListing = yield listing_1.Listing.findById(listing._id);
        expect(deletedListing).toEqual(null);
    }));
    it('Not Admin: Fails to delete listing', () => __awaiter(void 0, void 0, void 0, function* () {
        const listing = yield createListing();
        const cookie = yield global.login();
        yield (0, supertest_1.default)(app_1.app)
            .post(`/api/admin/listing/delete/${listing._id}`)
            .set('x-access-token', cookie)
            .send()
            .expect(401);
    }));
});
