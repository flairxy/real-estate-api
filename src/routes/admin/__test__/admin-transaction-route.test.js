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
const transaction_1 = require("../../../models/transaction");
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
const mockTransactions = (data) => __awaiter(void 0, void 0, void 0, function* () {
    const transaction = transaction_1.Transaction.generate(data);
    yield transaction.save();
    return transaction;
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
describe('admin-transaction-routes', () => {
    it('Admin: Fetches transactions', () => __awaiter(void 0, void 0, void 0, function* () {
        const cookie = yield global.adminLogin();
        const listing = yield createListing();
        const user = yield createUser();
        const data = {
            code: 'testcode',
            reference: 'reference',
            amount: 1000,
            list: listing._id,
            user: user._id,
        };
        //create transaction
        const transactionResponse = yield mockTransactions(data);
        const response = yield (0, supertest_1.default)(app_1.app)
            .get('/api/admin/transactions')
            .set('x-access-token', cookie)
            .send()
            .expect(200);
        expect(response.body.length).toBeGreaterThanOrEqual(1);
        expect(response.body[0].list.id).toEqual(listing.id);
        expect(response.body[0].reference).toEqual(transactionResponse.reference);
    }), 10000);
    // /api/admin/transaction/:id
    it('Admin: Fetches single listing', () => __awaiter(void 0, void 0, void 0, function* () {
        const cookie = yield global.adminLogin();
        const listing = yield createListing();
        const user = yield createUser();
        const data = {
            code: 'testcode',
            reference: 'reference',
            amount: 1000,
            list: listing._id,
            user: user._id,
        };
        //create transaction
        const transactionResponse = yield mockTransactions(data);
        const response = yield (0, supertest_1.default)(app_1.app)
            .get(`/api/admin/transaction/${transactionResponse._id}`)
            .set('x-access-token', cookie)
            .send()
            .expect(200);
        expect(response.body.list.id).toEqual(listing.id);
        expect(response.body.reference).toEqual(transactionResponse.reference);
    }));
    // /api/admin/transaction/:id/complete
    it('Admin: Marks transaction as complete', () => __awaiter(void 0, void 0, void 0, function* () {
        const cookie = yield global.adminLogin();
        const listing = yield createListing();
        const user = yield createUser();
        const data = {
            code: 'testcode',
            reference: 'reference',
            amount: 1000,
            list: listing._id,
            user: user._id,
        };
        //create transaction
        const transactionResponse = yield mockTransactions(data);
        expect(transactionResponse.status).toEqual(constants_1.TransactionStatus.PENDING);
        const response = yield (0, supertest_1.default)(app_1.app)
            .post(`/api/admin/transaction/${transactionResponse._id}/complete`)
            .set('x-access-token', cookie)
            .send()
            .expect(201);
        expect(response.body.status).toEqual(constants_1.TransactionStatus.COMPLETED);
    }));
    // /api/admin/transaction/:id/pending
    it('Admin: Marks transaction as pending', () => __awaiter(void 0, void 0, void 0, function* () {
        const cookie = yield global.adminLogin();
        const listing = yield createListing();
        const user = yield createUser();
        const data = {
            code: 'testcode',
            reference: 'reference',
            amount: 1000,
            list: listing._id,
            user: user._id,
            status: constants_1.TransactionStatus.COMPLETED
        };
        //create transaction
        const transactionResponse = yield mockTransactions(data);
        expect(transactionResponse.status).toEqual(constants_1.TransactionStatus.COMPLETED);
        const response = yield (0, supertest_1.default)(app_1.app)
            .post(`/api/admin/transaction/${transactionResponse._id}/pending`)
            .set('x-access-token', cookie)
            .send()
            .expect(201);
        expect(response.body.status).toEqual(constants_1.TransactionStatus.PENDING);
    }));
    // /api/admin/transactions/delete
    it('Admin: Deletes transaction', () => __awaiter(void 0, void 0, void 0, function* () {
        const cookie = yield global.adminLogin();
        const listing = yield createListing();
        const user = yield createUser();
        const data = {
            code: 'testcode',
            reference: 'reference',
            amount: 1000,
            list: listing._id,
            user: user._id,
            status: constants_1.TransactionStatus.PENDING
        };
        //create transaction
        const transactionResponse = yield mockTransactions(data);
        yield (0, supertest_1.default)(app_1.app)
            .post(`/api/admin/transactions/delete`)
            .set('x-access-token', cookie)
            .send({
            ids: [transactionResponse._id]
        })
            .expect(201);
        const transaction = yield transaction_1.Transaction.findById(transactionResponse.id);
        expect(transaction).toEqual(null);
    }));
});
