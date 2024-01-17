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
const mongoose_1 = __importDefault(require("mongoose"));
const app_1 = require("./app");
const start = () => __awaiter(void 0, void 0, void 0, function* () {
    if (!process.env.CLOUDINARY_NAME || !process.env.CLOUDINARY_KEY || !process.env.CLOUDINARY_SECRET) {
        throw new Error('Cloudinary must be set');
    }
    if (!process.env.SITE_URL) {
        throw new Error('Site URL must be defined');
    }
    if (!process.env.JWT_KEY) {
        throw new Error('JWT_KEY must be defined');
    }
    if (!process.env.PAYSTACK_SECRET) {
        throw new Error('Paystack payment must be set');
    }
    if (!process.env.MONGO_URI) {
        throw new Error('MONGO_URI must be defined');
    }
    const PORT = process.env.PORT || 5000;
    try {
        yield mongoose_1.default.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');
    }
    catch (error) {
        console.error(error);
    }
    app_1.app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
});
start();
