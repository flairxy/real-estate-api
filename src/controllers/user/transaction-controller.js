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
Object.defineProperty(exports, "__esModule", { value: true });
exports.verify = exports.create = exports.getTransactions = exports.getListing = void 0;
const transaction_1 = require("../../models/transaction");
const bad_request_error_1 = require("../../errors/bad-request-error");
const services_1 = require("../../services");
const constants_1 = require("../../utils/constants");
const user_1 = require("../../models/user");
const not_authorized_error_1 = require("../../errors/not-authorized-error");
const listing_1 = require("../../models/listing");
const not_found_error_1 = require("../../errors/not-found-error");
const user_listing_1 = require("../../models/user-listing");
const password_1 = require("../../utils/password");
const LISTING = 'listing';
const getListing = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user = req.currentUser;
    const UserListings = yield user_listing_1.UserListing.find({ user: user === null || user === void 0 ? void 0 : user.id });
    let newListing = [];
    for (let i = 0; i < UserListings.length; i++) {
        const list = yield listing_1.Listing.findById(UserListings[i].listing).populate('images');
        newListing.push(list);
    }
    res.send(newListing);
});
exports.getListing = getListing;
const getTransactions = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user = req.currentUser;
    const transactions = yield transaction_1.Transaction.find({ user: user === null || user === void 0 ? void 0 : user.id });
    res.send(transactions);
});
exports.getTransactions = getTransactions;
const create = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const currentUser = req.currentUser;
    if (!currentUser)
        throw new not_authorized_error_1.NotAuthorizedError();
    const user = yield user_1.User.findById(currentUser.id);
    const listing = yield listing_1.Listing.findById(id);
    if (!user)
        throw new not_authorized_error_1.NotAuthorizedError();
    if (!listing)
        throw new not_found_error_1.NotFoundError('Invalid Listing');
    if (listing.locked && user._id !== listing.locked_by)
        throw new bad_request_error_1.BadRequestError('Unable to process request');
    if (listing.price <= 200000000) {
        const response = yield services_1.PaystackService.initialize(user.email, listing.price.toString());
        if ((!response && !response.data.reference) || !response.data.access_code)
            throw new bad_request_error_1.BadRequestError('Failed to initiate transaction.');
        const transaction = transaction_1.Transaction.generate({
            list: listing.id,
            user: user.id,
            amount: listing.price,
            reference: response.data.reference,
            code: response.data.access_code,
            status: constants_1.TransactionStatus.PENDING,
            email: user.email,
        });
        yield transaction.save();
        //lock listing
        listing.locked = true;
        listing.locked_at = new Date(Date.now());
        yield listing.save();
        res.status(201).send({ url: response.data.authorization_url });
    }
    else {
        const transaction = transaction_1.Transaction.generate({
            list: listing.id,
            user: user.id,
            amount: listing.price,
            reference: (0, password_1.randomChars)(9),
            status: constants_1.TransactionStatus.PENDING,
            email: user.email,
            isTransfer: true,
        });
        yield transaction.save();
        //lock listing
        listing.locked = true;
        listing.locked_at = new Date(Date.now());
        yield listing.save();
        res.status(201).send('success');
    }
});
exports.create = create;
const verify = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { reference } = req.params;
    const transaction = yield transaction_1.Transaction.findOne({ reference });
    if (!transaction)
        throw new bad_request_error_1.BadRequestError('Invalid transaction ID or reference');
    const response = yield services_1.PaystackService.verifyTransaction(transaction.reference);
    const paidAmount = response.data.amount / 100;
    if (response &&
        response.status === true &&
        paidAmount === transaction.amount &&
        response.data.reference === transaction.reference &&
        response.data.status === 'success') {
        transaction.status = constants_1.TransactionStatus.COMPLETED;
        transaction.txId = response.data.id;
        yield transaction.save();
        const userListing = yield user_listing_1.UserListing.findOne({
            user: transaction.user,
            listing: transaction.list,
        });
        const listing = yield listing_1.Listing.findById(transaction.list);
        if (listing) {
            listing.status = constants_1.ListingStatus.SOLD;
            yield listing.save();
        }
        if (!userListing)
            yield user_listing_1.UserListing.create({
                user: transaction.user,
                transaction: transaction.id,
                listing: transaction.list,
            });
        res.status(201).send({ message: 'Transaction completed successfully' });
    }
    else {
        throw new bad_request_error_1.BadRequestError(response.data.gateway_response);
    }
});
exports.verify = verify;
