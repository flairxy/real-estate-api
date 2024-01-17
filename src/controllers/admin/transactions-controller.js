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
exports.filter = exports.deleteTransactions = exports.markAsPending = exports.markAsCompleted = exports.verify = exports.find = exports.getTransactions = void 0;
const bad_request_error_1 = require("../../errors/bad-request-error");
const transaction_1 = require("../../models/transaction");
const constants_1 = require("../../utils/constants");
const not_found_error_1 = require("../../errors/not-found-error");
const services_1 = require("../../services");
const mongoose_1 = __importDefault(require("mongoose"));
const user_listing_1 = require("../../models/user-listing");
const USER = 'user';
const LISTING = 'list';
const getTransactions = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const transactions = yield transaction_1.Transaction.find({}).populate([USER, LISTING]);
    res.send(transactions);
});
exports.getTransactions = getTransactions;
const find = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const transaction = yield transaction_1.Transaction.findById(id).populate([USER, LISTING]);
    res.send(transaction);
});
exports.find = find;
const verify = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const transaction = yield transaction_1.Transaction.findById(id);
    if (!transaction)
        throw new bad_request_error_1.BadRequestError('Invalid transaction ID or reference');
    const response = yield services_1.PaystackService.verifyTransaction(transaction.reference);
    if (response &&
        response.status === true &&
        response.data.amount === transaction.amount &&
        response.data.reference === transaction.reference &&
        response.data.status === 'success') {
        transaction.status = constants_1.TransactionStatus.COMPLETED;
        transaction.txId = response.data.id;
        yield transaction.save();
        res.status(201).send({ message: 'Transaction completed successfully' });
    }
    else {
        throw new bad_request_error_1.BadRequestError(response.data.gateway_response);
    }
});
exports.verify = verify;
const markAsCompleted = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const session = yield mongoose_1.default.startSession();
    session.startTransaction();
    try {
        const { id } = req.params;
        const transaction = yield transaction_1.Transaction.findById(id);
        if (!transaction)
            throw new not_found_error_1.NotFoundError();
        transaction.status = constants_1.TransactionStatus.COMPLETED;
        yield transaction.save();
        const userListing = yield user_listing_1.UserListing.create({
            user: transaction.user,
            listing: transaction.list,
            transaction: transaction._id,
        });
        if (!userListing)
            throw new Error('Failed to create user listing');
        yield session.commitTransaction();
        session.endSession();
        res.status(201).send(transaction);
    }
    catch (error) {
        yield session.abortTransaction();
        session.endSession();
        throw error;
    }
});
exports.markAsCompleted = markAsCompleted;
const markAsPending = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const transaction = yield transaction_1.Transaction.findById(id);
    if (!transaction)
        throw new not_found_error_1.NotFoundError();
    transaction.status = constants_1.TransactionStatus.PENDING;
    yield transaction.save();
    res.status(201).send(transaction);
});
exports.markAsPending = markAsPending;
const deleteTransactions = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { ids } = req.body;
    yield transaction_1.Transaction.updateMany({ _id: ids }, {
        isDeleted: true,
    });
    res.status(201).send({ message: 'Deleted Successfully' });
});
exports.deleteTransactions = deleteTransactions;
const filter = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { status } = req.body;
    const transactions = yield transaction_1.Transaction.find({ status }).populate([
        USER,
        LISTING,
    ]);
    res.send(transactions);
});
exports.filter = filter;
