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
exports.verify = exports.getListing = exports.getListings = exports.getFeaturedListing = void 0;
const listing_1 = require("../models/listing");
const constants_1 = require("../utils/constants");
const transaction_1 = require("../models/transaction");
const bad_request_error_1 = require("../errors/bad-request-error");
const services_1 = require("../services");
const IMAGES = 'images';
const getFeaturedListing = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const listings = yield listing_1.Listing.find({
        featured: true,
        locked: false,
        status: constants_1.ListingStatus.ACTIVE,
    }).populate(IMAGES);
    const sListings = listings.slice(0, 6);
    res.send(sListings);
});
exports.getFeaturedListing = getFeaturedListing;
const getListings = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { page } = req.query;
    const p = page;
    const pageSize = 9;
    let startIndex = (p - 1) * pageSize;
    let endIndex = p * pageSize;
    const listings = yield listing_1.Listing.find({
        status: constants_1.ListingStatus.ACTIVE,
        locked: false,
    }).populate(IMAGES);
    const totalListings = listings.length;
    const paginatedListings = listings.slice(startIndex, endIndex);
    const totalPage = Math.ceil(listings.length / pageSize);
    res.send({
        properties: paginatedListings,
        totalPage,
        totalListings,
    });
});
exports.getListings = getListings;
const getListing = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const listings = yield listing_1.Listing.findById(id).populate(IMAGES);
    res.send(listings);
});
exports.getListing = getListing;
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
