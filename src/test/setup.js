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
const mongodb_memory_server_1 = require("mongodb-memory-server");
const mongoose_1 = __importDefault(require("mongoose"));
const app_1 = require("../app");
const user_1 = require("../models/user");
const constants_1 = require("../utils/constants");
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let mongo;
beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
    process.env.JWT_KEY = 'asdf';
    mongo = yield mongodb_memory_server_1.MongoMemoryServer.create();
    const mongoUri = mongo.getUri();
    yield mongoose_1.default.connect(mongoUri);
}));
//this hook clears the db before each test is run
beforeEach(() => __awaiter(void 0, void 0, void 0, function* () {
    const collections = yield mongoose_1.default.connection.db.collections();
    for (const collection of collections) {
        yield collection.deleteMany({});
    }
}));
//disconnect when all tests are finished
afterAll(() => __awaiter(void 0, void 0, void 0, function* () {
    if (mongo) {
        yield mongo.stop();
    }
    yield mongoose_1.default.connection.close();
}));
const userDetails = {
    firstname: 'Test',
    lastname: 'User',
    phone: '0123456789',
    email: 'user@example.com',
    password: 'password',
};
global.login = () => __awaiter(void 0, void 0, void 0, function* () {
    const user = user_1.User.generate(Object.assign(Object.assign({}, userDetails), { role: constants_1.Roles.USER }));
    yield user.save();
    const response = yield (0, supertest_1.default)(app_1.app)
        .post('/api/login')
        .send({ email: userDetails.email, password: userDetails.password })
        .expect(200);
    const cookie = response.body.token;
    return cookie;
});
global.adminLogin = () => __awaiter(void 0, void 0, void 0, function* () {
    const user = user_1.User.generate(Object.assign(Object.assign({}, userDetails), { role: constants_1.Roles.ADMIN }));
    yield user.save();
    const response = yield (0, supertest_1.default)(app_1.app)
        .post('/api/login')
        .send({ email: userDetails.email, password: userDetails.password })
        .expect(200);
    const cookie = response.body.token;
    return cookie;
});
