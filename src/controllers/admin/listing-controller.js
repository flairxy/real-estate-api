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
exports.deleteResource = exports.uploadResource = exports.filter = exports.deleteListing = exports.update = exports.updateFeaturedStatus = exports.create = exports.find = exports.getListings = void 0;
const listing_1 = require("../../models/listing");
const services_1 = require("../../services");
const upload_1 = require("../../models/upload");
const not_found_error_1 = require("../../errors/not-found-error");
const bad_request_error_1 = require("../../errors/bad-request-error");
const mongoose_1 = __importDefault(require("mongoose"));
const IMAGES = 'images';
const TYPE = 'listing';
const getListings = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { page } = req.query;
    const p = page;
    const pageSize = 9;
    let startIndex = (p - 1) * pageSize;
    let endIndex = p * pageSize;
    const listings = yield listing_1.Listing.find({}).populate(IMAGES);
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
const find = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const listing = yield listing_1.Listing.findById(id).populate(IMAGES);
    res.send(listing);
});
exports.find = find;
const create = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { description, type, address, country, state, price, status, featured, title, category, landmarks, accessories, coordinate, code, currency, } = req.body;
    const listing = listing_1.Listing.generate({
        currency,
        title,
        description,
        type,
        category,
        address,
        country,
        state,
        price,
        status,
        featured,
        landmarks,
        accessories,
        coordinate,
        code,
    });
    yield listing.save();
    res.status(201).send(listing);
});
exports.create = create;
const updateFeaturedStatus = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = req.params.id;
    const listing = yield listing_1.Listing.findById(id);
    if (!listing)
        throw new not_found_error_1.NotFoundError();
    listing.featured = !listing.featured;
    yield listing.save();
    res.status(201).send(listing);
});
exports.updateFeaturedStatus = updateFeaturedStatus;
const update = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { title, description, type, category, address, country, state, price, status, featured, landmarks, accessories, coordinate, code, currency, } = req.body;
    const { id } = req.params;
    const listing = yield listing_1.Listing.findOneAndUpdate({ _id: id }, {
        title,
        description,
        type,
        category,
        address,
        country,
        state,
        price,
        status,
        featured,
        landmarks,
        accessories,
        coordinate,
        code,
        currency,
    }, {
        new: true,
    });
    res.status(201).send(listing);
});
exports.update = update;
const deleteListing = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const list = yield listing_1.Listing.findById(id);
    if (list) {
        const uploadIds = list.images; //ids of uploads
        const publicIds = [];
        for (let count = 0; count < uploadIds.length; count++) {
            const upload = yield upload_1.Upload.findById(uploadIds[count]);
            if (upload)
                publicIds.push(upload.public_id);
        }
        if (publicIds.length > 0) {
            yield services_1.ImageService.deleteUploads(publicIds, id, TYPE);
            yield upload_1.Upload.deleteMany({ _id: uploadIds });
        }
        yield listing_1.Listing.deleteOne({ _id: id });
    }
    res.status(201).send({});
});
exports.deleteListing = deleteListing;
const filter = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const location = req.body.location;
    let price = req.body.price;
    let listing = null;
    if (isNaN(price) || price <= 0) {
        price = 1000000000000000;
    }
    if (location.trim().length === 0) {
        listing = yield listing_1.Listing.find({
            $or: [{ price: { $lte: price } }],
        });
    }
    else
        listing = yield listing_1.Listing.find({
            $or: [{ price: { $lte: price } }],
            location,
        }).populate(IMAGES);
    res.send(listing);
});
exports.filter = filter;
const uploadResource = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const session = yield mongoose_1.default.startSession();
    session.startTransaction();
    try {
        const { id } = req.params;
        const file = req.file;
        if (file === undefined)
            throw new bad_request_error_1.BadRequestError('Images are required');
        const utype = file.mimetype.split('/')[0];
        const b64 = Buffer.from(file.buffer).toString('base64');
        const dataURI = 'data:' + file.mimetype + ';base64,' + b64;
        const listing = yield listing_1.Listing.findById(id);
        if (!listing)
            throw new not_found_error_1.NotFoundError();
        const response = yield services_1.ImageService.resourceUpload(dataURI, id, TYPE, utype);
        const upload = upload_1.Upload.generate({
            url: response.url,
            asset_id: response.asset_id,
            public_id: response.public_id,
            resource_type: utype,
        });
        yield upload.save();
        if (!upload)
            throw new Error('Upload not created');
        listing.images = [...listing.images, upload._id];
        yield listing.save();
        yield session.commitTransaction();
        session.endSession();
        res.status(201).send(listing);
    }
    catch (error) {
        console.log(error);
        yield session.abortTransaction();
        session.endSession();
        throw error;
    }
});
exports.uploadResource = uploadResource;
const deleteResource = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id, public_id } = req.body;
    const upload = yield upload_1.Upload.findById(id);
    if (upload) {
        yield services_1.ImageService.deleteImage(public_id);
        yield upload_1.Upload.deleteOne({ _id: upload._id });
    }
    res.status(201).send({});
});
exports.deleteResource = deleteResource;
