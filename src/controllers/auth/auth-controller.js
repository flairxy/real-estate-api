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
exports.runJobs = exports.refreshLink = exports.resetPassword = exports.verifyEmail = exports.resetToken = exports.updatePassword = exports.logout = exports.login = exports.register = exports.authUser = void 0;
const bad_request_error_1 = require("../../errors/bad-request-error");
const user_1 = require("../../models/user");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const password_manager_1 = require("../../services/password-manager");
const constants_1 = require("../../utils/constants");
const services_1 = require("../../services");
const token_1 = require("../../models/token");
const crypto_1 = require("crypto");
const mongoose_1 = __importDefault(require("mongoose"));
const not_found_error_1 = require("../../errors/not-found-error");
const listing_1 = require("../../models/listing");
const authUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    res.send({ currentUser: req.currentUser || null });
});
exports.authUser = authUser;
const register = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const session = yield mongoose_1.default.startSession();
    session.startTransaction();
    try {
        const { firstname, lastname, phone, email, password } = req.body;
        const existingUser = yield user_1.User.findOne({ email });
        if (existingUser) {
            throw new bad_request_error_1.BadRequestError('Email in use');
        }
        const user = user_1.User.generate({
            firstname,
            lastname,
            phone,
            email,
            password,
            role: constants_1.Roles.USER,
        });
        yield user.save();
        const tokenGen = (0, crypto_1.randomBytes)(20).toString('hex');
        const token = token_1.Token.generate({ user: user._id, token: tokenGen });
        yield token.save();
        const emailSent = yield services_1.EmailService.verifyEmail(user, tokenGen);
        if (!emailSent)
            throw new Error('Verification mail not sent');
        yield session.commitTransaction();
        session.endSession();
        const userJwt = jsonwebtoken_1.default.sign({
            id: user.id,
            email: user.email,
            phone: user.phone,
            firstname: user.firstname,
            lastname: user.lastname,
            type: user.role,
            is_verified: user.is_verified,
        }, process.env.JWT_KEY);
        res.status(201).send({ data: user, token: userJwt });
    }
    catch (error) {
        yield session.abortTransaction();
        session.endSession();
        throw error;
    }
});
exports.register = register;
const login = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body;
    const existingUser = yield user_1.User.findOne({ email });
    if (!existingUser) {
        throw new bad_request_error_1.BadRequestError('Invalid credentials');
    }
    const passwordMatch = yield password_manager_1.PasswordManager.compare(existingUser.password, password);
    if (!passwordMatch) {
        throw new bad_request_error_1.BadRequestError('Invalid credentials');
    }
    const token = jsonwebtoken_1.default.sign({
        id: existingUser.id,
        email: existingUser.email,
        phone: existingUser.phone,
        firstname: existingUser.firstname,
        lastname: existingUser.lastname,
        type: existingUser.role,
        is_verified: existingUser.is_verified,
    }, process.env.JWT_KEY //the ! afer process.env.JWT_KEY is to stop typescript warning
    );
    // req.session = { token: userJwt };
    res.status(200).send({ data: existingUser, token });
});
exports.login = login;
const logout = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    req.session = null;
    res.send({});
});
exports.logout = logout;
const updatePassword = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { password, oldPassword } = req.body;
    const user = yield user_1.User.findById((_a = req.currentUser) === null || _a === void 0 ? void 0 : _a.id);
    if (!user)
        throw new not_found_error_1.NotFoundError();
    //matches old password
    const passwordMatch = yield password_manager_1.PasswordManager.compare(user.password, oldPassword);
    const samePassword = yield password_manager_1.PasswordManager.compare(user.password, password);
    if (samePassword) {
        throw new bad_request_error_1.BadRequestError('Password cannot be same as old password');
    }
    if (!passwordMatch) {
        throw new bad_request_error_1.BadRequestError('Invalid credentials');
    }
    user.password = password;
    yield user.save();
    res.status(201).send({ message: 'Password updated successfully' });
});
exports.updatePassword = updatePassword;
const resetToken = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const session = yield mongoose_1.default.startSession();
    session.startTransaction();
    try {
        const { email } = req.body;
        const user = yield user_1.User.findOne({ email });
        if (!user)
            throw new bad_request_error_1.BadRequestError('User not found');
        const tokenGen = (0, crypto_1.randomBytes)(20).toString('hex');
        const token = token_1.Token.generate({ user: user._id, token: tokenGen });
        yield token.save();
        const emailSent = yield services_1.EmailService.resetToken(user, tokenGen);
        if (!emailSent)
            throw new Error('Reset mail not sent');
        yield session.commitTransaction();
        session.endSession();
        res.send({});
    }
    catch (error) {
        yield session.abortTransaction();
        session.endSession();
        throw error;
    }
});
exports.resetToken = resetToken;
const verifyEmail = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _b;
    const user = yield user_1.User.findById((_b = req.currentUser) === null || _b === void 0 ? void 0 : _b.id);
    if (!user)
        throw new not_found_error_1.NotFoundError();
    const token = yield token_1.Token.findOne({
        user: user._id,
        token: req.params.token,
    });
    if (!token || (token && new Date(Date.now()) > new Date(token.expires)))
        throw new bad_request_error_1.BadRequestError('Token Invalid or expired');
    yield token.deleteOne({ _id: token.id });
    user.is_verified = true;
    yield user.save();
    const userJwt = jsonwebtoken_1.default.sign({
        id: user.id,
        email: user.email,
        phone: user.phone,
        firstname: user.firstname,
        lastname: user.lastname,
        type: user.role,
        is_verified: user.is_verified,
    }, process.env.JWT_KEY);
    res.status(201).send({ data: user, token: userJwt });
});
exports.verifyEmail = verifyEmail;
const resetPassword = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const session = yield mongoose_1.default.startSession();
    session.startTransaction();
    try {
        const { password } = req.body;
        const token_ = req.params.token;
        const token = yield token_1.Token.findOne({ token: token_ });
        if (!token)
            throw new not_found_error_1.NotFoundError();
        const user = yield user_1.User.findById(token.user);
        if (!user)
            throw new not_found_error_1.NotFoundError();
        if (!token || (token && new Date(Date.now()) > new Date(token.expires)))
            throw new bad_request_error_1.BadRequestError('Token Invalid or expired');
        yield token.deleteOne({ _id: token.id });
        user.password = password;
        yield user.save();
        res.status(201).send({ message: 'Password reset successfully' });
    }
    catch (error) {
        yield session.abortTransaction();
        session.endSession();
        throw error;
    }
});
exports.resetPassword = resetPassword;
const refreshLink = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const session = yield mongoose_1.default.startSession();
    session.startTransaction();
    try {
        const user = yield user_1.User.findOne({ _id: req.currentUser.id });
        if (!user)
            throw new bad_request_error_1.BadRequestError('User not found');
        const tokenGen = (0, crypto_1.randomBytes)(20).toString('hex');
        yield token_1.Token.deleteMany({ user: user._id });
        const token = token_1.Token.generate({ user: user._id, token: tokenGen });
        yield token.save();
        const emailSent = yield services_1.EmailService.verifyEmail(user, tokenGen);
        if (!emailSent)
            throw new Error('Verification mail not sent');
        yield session.commitTransaction();
        session.endSession();
        res.status(201).send({ message: 'Verify Email' });
    }
    catch (error) {
        yield session.abortTransaction();
        session.endSession();
        throw error;
    }
});
exports.refreshLink = refreshLink;
const runJobs = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // unlock locked listings
    const admin = yield user_1.User.findOne({ role: constants_1.Roles.ADMIN });
    const listings = yield listing_1.Listing.find({
        locked: true,
        status: constants_1.ListingStatus.ACTIVE,
    });
    for (const listing of listings) {
        const lockedMinutes = new Date(listing.locked_at).getTime();
        const currentMinutes = new Date(Date.now()).getTime();
        const diff = (currentMinutes - lockedMinutes) / 1000;
        const ti = Math.abs(Math.round(diff / 60));
        const isDue = ti > 5;
        if (isDue) {
            listing.locked = false;
            listing.locked_by = admin === null || admin === void 0 ? void 0 : admin._id;
            yield listing.save();
        }
    }
    res.send('Jobs successful');
});
exports.runJobs = runJobs;
