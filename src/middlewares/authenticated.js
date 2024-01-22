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
exports.auth = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const not_authorized_error_1 = require("../errors/not-authorized-error");
const user_1 = require("../models/user");
const auth = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const token = req.headers['x-access-token'];
    if (!token) {
        throw new not_authorized_error_1.NotAuthorizedError();
    }
    try {
        const payload = jsonwebtoken_1.default.verify(token, process.env.JWT_KEY);
        const user = yield user_1.User.findById(payload.id);
        if (!user) {
            throw new not_authorized_error_1.NotAuthorizedError();
        }
        req.currentUser = payload;
    }
    catch (error) {
        error;
    }
    next();
});
exports.auth = auth;
