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
const constants_1 = require("../../../utils/constants");
const user_1 = require("../../../models/user");
const not_found_error_1 = require("../../../errors/not-found-error");
const userDetails = {
    firstname: 'Test',
    lastname: 'User',
    phone: '0123456789',
    email: 'test@example.com',
    password: 'password',
};
const createUser = (role) => __awaiter(void 0, void 0, void 0, function* () {
    const user = user_1.User.generate(Object.assign(Object.assign({}, userDetails), { role }));
    yield user.save();
    return user;
});
describe('admin-user-routes', () => {
    //current user test
    it('Responds with 200 if current user is admin', () => __awaiter(void 0, void 0, void 0, function* () {
        const cookie = yield global.adminLogin();
        const response = yield (0, supertest_1.default)(app_1.app)
            .get('/api/current-user')
            .set('x-access-token', cookie)
            .send()
            .expect(200);
        const user = yield user_1.User.findById(response.body.currentUser.id);
        if (user) {
            expect(user.role).toEqual(constants_1.Roles.ADMIN);
        }
        else {
            throw new not_found_error_1.NotFoundError();
        }
    }));
    it('Responds with 401 if not authenticated', () => __awaiter(void 0, void 0, void 0, function* () {
        yield (0, supertest_1.default)(app_1.app).get('/api/current-user').send().expect(401);
    }));
    it('Admin: Fetches users', () => __awaiter(void 0, void 0, void 0, function* () {
        yield createUser(constants_1.Roles.USER);
        const cookie = yield global.adminLogin();
        const response = yield (0, supertest_1.default)(app_1.app)
            .get('/api/admin/users')
            .set('x-access-token', cookie)
            .send()
            .expect(200);
        expect(response.body[0].email).toEqual(userDetails.email);
    }));
    it('Not Admin: Fails to fetch users', () => __awaiter(void 0, void 0, void 0, function* () {
        const cookie = yield global.login();
        yield (0, supertest_1.default)(app_1.app)
            .get('/api/admin/users')
            .set('x-access-token', cookie)
            .send()
            .expect(401);
    }));
    it('Admin: Fetches admins', () => __awaiter(void 0, void 0, void 0, function* () {
        yield createUser(constants_1.Roles.ADMIN);
        const cookie = yield global.adminLogin();
        const response = yield (0, supertest_1.default)(app_1.app)
            .get('/api/admin/users/admin')
            .set('x-access-token', cookie)
            .send()
            .expect(200);
        expect(response.body[0].email).toEqual(userDetails.email);
    }));
    it('Not Admin: Fails to fetch admins', () => __awaiter(void 0, void 0, void 0, function* () {
        const cookie = yield global.login();
        yield (0, supertest_1.default)(app_1.app)
            .get('/api/admin/users/admin')
            .set('x-access-token', cookie)
            .send()
            .expect(401);
    }));
    it('Admin: Fetches single user', () => __awaiter(void 0, void 0, void 0, function* () {
        const user = yield createUser(constants_1.Roles.USER);
        const cookie = yield global.adminLogin();
        const response = yield (0, supertest_1.default)(app_1.app)
            .get(`/api/admin/user/${user._id}`)
            .set('x-access-token', cookie)
            .send()
            .expect(200);
        expect(response.body.email).toEqual(userDetails.email);
    }));
    it('Not Admin: Fails to fetch single user', () => __awaiter(void 0, void 0, void 0, function* () {
        const user = yield createUser(constants_1.Roles.USER);
        const cookie = yield global.login();
        yield (0, supertest_1.default)(app_1.app)
            .get(`/api/admin/user/${user._id}`)
            .set('x-access-token', cookie)
            .send()
            .expect(401);
    }));
    it('Admin: Fetches users with email query', () => __awaiter(void 0, void 0, void 0, function* () {
        const user = yield createUser(constants_1.Roles.USER);
        const cookie = yield global.adminLogin();
        const response = yield (0, supertest_1.default)(app_1.app)
            .post('/api/admin/users/filter')
            .set('x-access-token', cookie)
            .send({ email: user.email })
            .expect(200);
        expect(response.body[0].email).toEqual(userDetails.email);
    }));
    it('Not Admin: Fails to fetch users with email query', () => __awaiter(void 0, void 0, void 0, function* () {
        const user = yield createUser(constants_1.Roles.USER);
        const cookie = yield global.login();
        yield (0, supertest_1.default)(app_1.app)
            .post('/api/admin/users/filter')
            .set('x-access-token', cookie)
            .send({ email: user.email })
            .expect(401);
    }));
    it('Admin: Updates user data', () => __awaiter(void 0, void 0, void 0, function* () {
        const user = yield createUser(constants_1.Roles.USER);
        const email = 'updated@mail.com';
        const cookie = yield global.adminLogin();
        const response = yield (0, supertest_1.default)(app_1.app)
            .post(`/api/admin/users/update/${user._id}`)
            .set('x-access-token', cookie)
            .send(Object.assign(Object.assign({}, userDetails), { email }))
            .expect(201);
        expect(response.body.email).toEqual(email);
    }));
    it('Not Admin: Fails to update user data', () => __awaiter(void 0, void 0, void 0, function* () {
        const user = yield createUser(constants_1.Roles.USER);
        const email = 'updated@mail.com';
        const cookie = yield global.login();
        yield (0, supertest_1.default)(app_1.app)
            .post(`/api/admin/users/update/${user._id}`)
            .set('x-access-token', cookie)
            .send(Object.assign(Object.assign({}, userDetails), { email }))
            .expect(401);
    }));
    it('Admin: Sets user to admin', () => __awaiter(void 0, void 0, void 0, function* () {
        const user = yield createUser(constants_1.Roles.USER);
        const cookie = yield global.adminLogin();
        yield (0, supertest_1.default)(app_1.app)
            .post(`/api/admin/users/set-role`)
            .set('x-access-token', cookie)
            .send({ ids: [user._id] })
            .expect(201);
        const updatedUser = yield user_1.User.findById(user._id);
        if (!updatedUser)
            throw new not_found_error_1.NotFoundError();
        expect(updatedUser.role).toEqual(constants_1.Roles.ADMIN);
    }));
    it('Not Admin: Fails to set user to admin', () => __awaiter(void 0, void 0, void 0, function* () {
        const user = yield createUser(constants_1.Roles.USER);
        const cookie = yield global.login();
        yield (0, supertest_1.default)(app_1.app)
            .post(`/api/admin/users/set-role`)
            .set('x-access-token', cookie)
            .send({ ids: [user._id] })
            .expect(401);
    }));
    it('Admin: Remove user as admin', () => __awaiter(void 0, void 0, void 0, function* () {
        const user = yield createUser(constants_1.Roles.ADMIN);
        const cookie = yield global.adminLogin();
        yield (0, supertest_1.default)(app_1.app)
            .post(`/api/admin/users/remove-role`)
            .set('x-access-token', cookie)
            .send({ ids: [user._id] })
            .expect(201);
        const updatedUser = yield user_1.User.findById(user._id);
        if (!updatedUser)
            throw new not_found_error_1.NotFoundError();
        expect(updatedUser.role).toEqual(constants_1.Roles.USER);
    }));
    it('Not Admin: Fails to remove user as admin', () => __awaiter(void 0, void 0, void 0, function* () {
        const user = yield createUser(constants_1.Roles.ADMIN);
        const cookie = yield global.login();
        yield (0, supertest_1.default)(app_1.app)
            .post(`/api/admin/users/remove-role`)
            .set('x-access-token', cookie)
            .send({ ids: [user._id] })
            .expect(401);
    }));
    it('Admin: Delete User', () => __awaiter(void 0, void 0, void 0, function* () {
        const user = yield createUser(constants_1.Roles.ADMIN);
        const cookie = yield global.adminLogin();
        yield (0, supertest_1.default)(app_1.app)
            .post(`/api/admin/users/delete`)
            .set('x-access-token', cookie)
            .send({ ids: [user._id] })
            .expect(201);
        const deletedUser = yield user_1.User.findById(user._id);
        expect(deletedUser).toEqual(null);
    }));
    it('Not Admin: Fails to delete user', () => __awaiter(void 0, void 0, void 0, function* () {
        const user = yield createUser(constants_1.Roles.ADMIN);
        const cookie = yield global.login();
        yield (0, supertest_1.default)(app_1.app)
            .post(`/api/admin/users/delete`)
            .set('x-access-token', cookie)
            .send({ ids: [user._id] })
            .expect(401);
    }));
});
