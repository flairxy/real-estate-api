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
const userDetails = {
    firstname: 'Test',
    lastname: 'User',
    phone: '0123456789',
    email: 'user@example.com',
    password: 'password',
};
//current user test
it('responds with details about the current user', () => __awaiter(void 0, void 0, void 0, function* () {
    const cookie = yield global.login(); //got the test/setup.ts file and see where we define the gloabl.signin
    const response = yield (0, supertest_1.default)(app_1.app)
        .get('/api/current-user')
        .set('x-access-token', cookie)
        .send()
        .expect(200);
    expect(response.body.currentUser.email).toEqual(userDetails.email);
}));
it('responds with 401 if not authenticated', () => __awaiter(void 0, void 0, void 0, function* () {
    yield (0, supertest_1.default)(app_1.app)
        .get('/api/current-user')
        .send()
        .expect(401);
}));
//Login test
it("fails when an email that doesn't exist is supplied", () => __awaiter(void 0, void 0, void 0, function* () {
    yield (0, supertest_1.default)(app_1.app)
        .post('/api/login')
        .send({ email: userDetails.email, password: userDetails.password })
        .expect(400);
}));
it('fails when an invalid password is supplied', () => __awaiter(void 0, void 0, void 0, function* () {
    yield (0, supertest_1.default)(app_1.app).post('/api/register').send(userDetails).expect(201);
    yield (0, supertest_1.default)(app_1.app)
        .post('/api/login')
        .send({ email: userDetails.email, password: 'passwordx' })
        .expect(400);
}));
it('responds with a cookie when given valid credentials', () => __awaiter(void 0, void 0, void 0, function* () {
    yield (0, supertest_1.default)(app_1.app).post('/api/register').send(userDetails).expect(201);
    const response = yield (0, supertest_1.default)(app_1.app)
        .post('/api/login')
        .send({ email: userDetails.email, password: 'password' })
        .expect(200);
    expect(response.body.token).toBeDefined();
}));
//Registration test
it('returns a 201 on successful registration', () => __awaiter(void 0, void 0, void 0, function* () {
    return (0, supertest_1.default)(app_1.app).post('/api/register').send(userDetails).expect(201);
}));
it('returns a 400 with an invalid email', () => __awaiter(void 0, void 0, void 0, function* () {
    yield (0, supertest_1.default)(app_1.app)
        .post('/api/register')
        .send(Object.assign(Object.assign({}, userDetails), { email: 'user.example.com' }))
        .expect(400);
}));
it('reurns a 400 with an invalid password', () => __awaiter(void 0, void 0, void 0, function* () {
    yield (0, supertest_1.default)(app_1.app)
        .post('/api/register')
        .send(Object.assign(Object.assign({}, userDetails), { password: 'pa' }))
        .expect(400);
}));
it('reurns a 400 with missing firstname, lastname, phone, email or password', () => __awaiter(void 0, void 0, void 0, function* () {
    yield (0, supertest_1.default)(app_1.app)
        .post('/api/register')
        .send(Object.assign(Object.assign({}, userDetails), { firstname: '' }))
        .expect(400);
    yield (0, supertest_1.default)(app_1.app)
        .post('/api/register')
        .send(Object.assign(Object.assign({}, userDetails), { lastname: '' }))
        .expect(400);
    yield (0, supertest_1.default)(app_1.app)
        .post('/api/register')
        .send(Object.assign(Object.assign({}, userDetails), { phone: '' }))
        .expect(400);
    yield (0, supertest_1.default)(app_1.app)
        .post('/api/register')
        .send(Object.assign(Object.assign({}, userDetails), { email: '' }))
        .expect(400);
    yield (0, supertest_1.default)(app_1.app)
        .post('/api/register')
        .send(Object.assign(Object.assign({}, userDetails), { password: '' }))
        .expect(400);
}));
it('disallows duplicate emails', () => __awaiter(void 0, void 0, void 0, function* () {
    yield (0, supertest_1.default)(app_1.app)
        .post('/api/register')
        .send(userDetails)
        .expect(201);
    yield (0, supertest_1.default)(app_1.app)
        .post('/api/register')
        .send(userDetails)
        .expect(400);
}));
it('sets a cookies after successful registration', () => __awaiter(void 0, void 0, void 0, function* () {
    yield (0, supertest_1.default)(app_1.app)
        .post('/api/register')
        .send(userDetails)
        .expect(201);
}));
//Logout test
it('clears the cookie after logout', () => __awaiter(void 0, void 0, void 0, function* () {
    yield (0, supertest_1.default)(app_1.app)
        .post('/api/register')
        .send(userDetails)
        .expect(201);
    const response = yield (0, supertest_1.default)(app_1.app)
        .post('/api/logout')
        .send({})
        .expect(200);
    // expect(response.get('Set-Cookie')[0]).toBeDefined();
    expect(response.get('Set-Cookie')[0]).toEqual('session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; httponly');
}));
