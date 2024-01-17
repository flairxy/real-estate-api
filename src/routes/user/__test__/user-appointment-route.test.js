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
const appointment_1 = require("../../../models/appointment");
const user_1 = require("../../../models/user");
const listing_1 = require("../../../models/listing");
const constants_1 = require("../../../utils/constants");
const createListing = () => __awaiter(void 0, void 0, void 0, function* () {
    const listingDetails = {
        title: 'Title',
        description: 'Description',
        type: 1,
        category: 1,
        location: 'Abuja',
        price: 500,
    };
    const list = listing_1.Listing.generate(listingDetails);
    yield list.save();
    return list;
});
const mockAppointment = (date) => __awaiter(void 0, void 0, void 0, function* () {
    const list = yield createListing();
    const user = yield createUser();
    const appointment = appointment_1.Appointment.generate({
        list: list._id,
        user: user._id,
        date,
        description: 'Appointment Booked',
    });
    yield appointment.save();
    return appointment;
});
const userDetails = {
    firstname: 'Test',
    lastname: 'User',
    phone: '0123456789',
    email: 'test@example.com',
    password: 'password',
    role: constants_1.Roles.USER,
};
const createUser = () => __awaiter(void 0, void 0, void 0, function* () {
    const user = user_1.User.generate(userDetails);
    yield user.save();
    return user;
});
describe('user-appointment-routes', () => {
    it('User: Fetches appointments', () => __awaiter(void 0, void 0, void 0, function* () {
        const cookie = yield global.login();
        const date = new Date(new Date().getTime() + 2 * 86400000); //2 days from now
        yield mockAppointment(date);
        const response = yield (0, supertest_1.default)(app_1.app)
            .get('/api/user/appointments')
            .set('x-access-token', cookie)
            .send()
            .expect(200);
        expect(response.body.length).toBeGreaterThanOrEqual(1);
        expect(new Date(response.body[0].date)).toEqual(date);
    }));
    // // /api/user/appointment/:id
    it('User: Fetches single appointment', () => __awaiter(void 0, void 0, void 0, function* () {
        const cookie = yield global.login();
        const date = new Date(new Date().getTime() + 2 * 86400000); //2 days from now
        const appointment = yield mockAppointment(date);
        const response = yield (0, supertest_1.default)(app_1.app)
            .get(`/api/user/appointment/${appointment._id}`)
            .set('x-access-token', cookie)
            .send()
            .expect(200);
        expect(new Date(response.body.date)).toEqual(date);
    }));
    // /api/user/appointment/create
    it('User: Creates appointment', () => __awaiter(void 0, void 0, void 0, function* () {
        const cookie = yield global.login();
        const listing = yield createListing();
        const date = new Date(new Date().getTime() + 2 * 86400000); //2 days from now
        const data = {
            date,
            list: listing._id,
            description: 'Appointment Booked',
        };
        const response = yield (0, supertest_1.default)(app_1.app)
            .post(`/api/user/appointment/create`)
            .set('x-access-token', cookie)
            .send(data)
            .expect(201);
        expect(response.body.list).toEqual(listing._id.toString());
    }));
    // // /api/user/transaction/:id/update
    it('User: Updates appointment', () => __awaiter(void 0, void 0, void 0, function* () {
        const cookie = yield global.login();
        const listing = yield createListing();
        const date = new Date(new Date().getTime() + 2 * 86400000); //2 days from now
        const dateUpdated = new Date(new Date().getTime() + 3 * 86400000); //2 days from now
        const data = {
            date,
            list: listing._id,
            description: 'Appointment Booked',
        };
        const newDescription = 'Appointment Updated';
        const response = yield (0, supertest_1.default)(app_1.app)
            .post(`/api/user/appointment/create`)
            .set('x-access-token', cookie)
            .send(data)
            .expect(201);
        const updated = yield (0, supertest_1.default)(app_1.app)
            .post(`/api/user/appointment/${response.body.id}/update`)
            .set('x-access-token', cookie)
            .send(Object.assign(Object.assign({}, data), { description: newDescription, date: dateUpdated }))
            .expect(201);
        expect(updated.body.description).toEqual(newDescription);
        expect(new Date(updated.body.date)).toEqual(dateUpdated);
    }));
    it('User: Cancels appointment', () => __awaiter(void 0, void 0, void 0, function* () {
        const cookie = yield global.login();
        const listing = yield createListing();
        const date = new Date(new Date().getTime() + 2 * 86400000); //2 days from now
        const data = {
            date,
            list: listing._id,
            description: 'Appointment Booked',
        };
        const response = yield (0, supertest_1.default)(app_1.app)
            .post(`/api/user/appointment/create`)
            .set('x-access-token', cookie)
            .send(data)
            .expect(201);
        yield (0, supertest_1.default)(app_1.app)
            .post(`/api/user/appointment/${response.body.id}/cancel`)
            .set('x-access-token', cookie)
            .send()
            .expect(201);
        const appointment = yield appointment_1.Appointment.findById(response.body.id);
        expect(appointment).toEqual(null);
    }));
});
