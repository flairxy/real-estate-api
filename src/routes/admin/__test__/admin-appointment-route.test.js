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
    const admin = yield createUser();
    const appointment = appointment_1.Appointment.generate({
        list: list._id,
        user: admin._id,
        date,
        description: 'Appointment Booked',
    });
    yield appointment.save();
    return appointment;
});
const userDetails = {
    firstname: 'Test',
    lastname: 'Admin',
    phone: '0123456789',
    email: 'test@example.com',
    password: 'password',
    role: constants_1.Roles.USER,
};
const createUser = () => __awaiter(void 0, void 0, void 0, function* () {
    const admin = user_1.User.generate(userDetails);
    yield admin.save();
    return admin;
});
describe('admin-appointment-routes', () => {
    it('Admin: Fetches appointments', () => __awaiter(void 0, void 0, void 0, function* () {
        const cookie = yield global.adminLogin();
        const date = new Date(new Date().getTime() + 2 * 86400000); //2 days from now
        yield mockAppointment(date);
        const response = yield (0, supertest_1.default)(app_1.app)
            .get('/api/admin/appointments')
            .set('x-access-token', cookie)
            .send()
            .expect(200);
        expect(response.body.length).toBeGreaterThanOrEqual(1);
        expect(new Date(response.body[0].date)).toEqual(date);
    }));
    // // /api/admin/appointment/:id
    it('Admin: Fetches single appointment', () => __awaiter(void 0, void 0, void 0, function* () {
        const cookie = yield global.adminLogin();
        const date = new Date(new Date().getTime() + 2 * 86400000); //2 days from now
        const appointment = yield mockAppointment(date);
        const response = yield (0, supertest_1.default)(app_1.app)
            .get(`/api/admin/appointment/${appointment._id}`)
            .set('x-access-token', cookie)
            .send()
            .expect(200);
        expect(new Date(response.body.date)).toEqual(date);
    }));
    // /api/admin/appointment/create
    it('Admin: Creates appointment', () => __awaiter(void 0, void 0, void 0, function* () {
        const cookie = yield global.adminLogin();
        const listing = yield createListing();
        const user = yield createUser();
        const date = new Date(new Date().getTime() + 2 * 86400000); //2 days from now
        const data = {
            date,
            list: listing._id,
            description: 'Appointment Booked',
            userId: user._id,
        };
        const response = yield (0, supertest_1.default)(app_1.app)
            .post(`/api/admin/appointment/create`)
            .set('x-access-token', cookie)
            .send(data)
            .expect(201);
        expect(response.body.list).toEqual(listing._id.toString());
    }));
    // // /api/admin/appointment/:id/update
    it('Admin: Updates appointment', () => __awaiter(void 0, void 0, void 0, function* () {
        const cookie = yield global.adminLogin();
        const date = new Date(new Date().getTime() + 2 * 86400000); //2 days from now
        const dateUpdated = new Date(new Date().getTime() + 3 * 86400000); //2 days from now
        const appointment = yield mockAppointment(date);
        const newDescription = 'Appointment Updated';
        const response = yield (0, supertest_1.default)(app_1.app)
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
    }));
    it('Admin: Cancels appointment', () => __awaiter(void 0, void 0, void 0, function* () {
        const cookie = yield global.adminLogin();
        const date = new Date(new Date().getTime() + 2 * 86400000); //2 days from now
        const response = yield mockAppointment(date);
        yield (0, supertest_1.default)(app_1.app)
            .post(`/api/admin/appointment/${response._id}/cancel`)
            .set('x-access-token', cookie)
            .send()
            .expect(201);
        const appointment = yield appointment_1.Appointment.findById(response.id);
        expect(appointment).toEqual(null);
    }));
});
