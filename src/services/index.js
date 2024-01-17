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
var _a, _b, _c;
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmailService = exports.PaystackService = exports.ImageService = exports.config = void 0;
const cloudinary_1 = require("cloudinary");
const bad_request_error_1 = require("../errors/bad-request-error");
const crypto_1 = require("crypto");
const axios_1 = __importDefault(require("axios"));
const nodemailer_1 = __importDefault(require("nodemailer"));
const verify_emails_1 = require("./emails/verify-emails");
const schedule_appointment_1 = require("./emails/schedule-appointment");
const password_reset_1 = require("./emails/password-reset");
const SECURE = 'production';
const ROOT = 'dynasty';
const config = () => {
    cloudinary_1.v2.config({
        cloud_name: process.env.CLOUDINARY_NAME,
        api_key: process.env.CLOUDINARY_KEY,
        api_secret: process.env.CLOUDINARY_SECRET,
        secure: true,
    });
};
exports.config = config;
class ImageService {
}
exports.ImageService = ImageService;
_a = ImageService;
ImageService.resourceUpload = (file, folder, type, resource_type) => __awaiter(void 0, void 0, void 0, function* () {
    (0, exports.config)();
    if (resource_type !== 'image' && resource_type !== 'video')
        throw new Error('Invalid resource type');
    try {
        const name = (0, crypto_1.randomBytes)(10).toString('hex');
        const result = yield cloudinary_1.v2.uploader.upload(file, {
            public_id: `${ROOT}/${type}/${folder}/${name}`,
            resource_type,
        });
        return result;
    }
    catch (error) {
        console.log(error);
        throw new bad_request_error_1.BadRequestError('Resource upload failed: ');
    }
});
ImageService.deleteUploads = (files, folderName, type) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        (0, exports.config)();
        yield cloudinary_1.v2.api.delete_resources(files, {
            type: 'upload',
        });
        const path = `${ROOT}/${type}/${folderName}`;
        yield cloudinary_1.v2.api.delete_folder(path);
    }
    catch (error) {
        console.log(error);
        throw new bad_request_error_1.BadRequestError('Failed to delete resources');
    }
});
ImageService.deleteImage = (file) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        (0, exports.config)();
        yield cloudinary_1.v2.api.delete_resources([file], {
            type: 'upload',
            resource_type: 'image',
        });
    }
    catch (error) {
        console.log(error);
        throw new bad_request_error_1.BadRequestError('Failed to delete resource');
    }
});
class PaystackService {
}
exports.PaystackService = PaystackService;
_b = PaystackService;
PaystackService.verifyTransaction = (reference) => __awaiter(void 0, void 0, void 0, function* () {
    const url = `https://api.paystack.co/transaction/verify/${reference}`;
    const response = yield axios_1.default.get(url, {
        headers: {
            Authorization: `Bearer ${process.env.PAYSTACK_SECRET}`,
        },
    });
    return response.data;
});
PaystackService.initialize = (email, amount) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const params = JSON.stringify({
            email,
            amount: `${amount}00`,
        });
        const url = 'https://api.paystack.co/transaction/initialize';
        const response = yield axios_1.default.post(url, params, {
            headers: {
                Authorization: `Bearer ${process.env.PAYSTACK_SECRET}`,
                'Content-Type': 'application/json',
            },
        });
        return response.data;
    }
    catch (error) {
        throw new Error(error);
    }
});
class EmailService {
}
exports.EmailService = EmailService;
_c = EmailService;
EmailService.config = () => {
    let transport = nodemailer_1.default.createTransport({
        host: 'pdrealestates.com',
        port: 465,
        secure: true,
        auth: {
            user: process.env.WEBMAIL_EMAIL,
            pass: process.env.WEBMAIL_PASSWORD,
        },
    });
    return transport;
};
EmailService.verifyEmail = (user, token) => __awaiter(void 0, void 0, void 0, function* () {
    const transporter = _c.config();
    if (user.email) {
        const mailOptions = {
            from: process.env.MAIL_FROM,
            to: user.email,
            subject: 'Email Verification',
            html: (0, verify_emails_1.verifyEmailTemplate)(`${process.env.SITE_URL}/verify-email/${token}`),
        };
        try {
            yield transporter.sendMail(mailOptions);
            return true;
        }
        catch (error) {
            throw new Error(error.message);
        }
    }
});
EmailService.scheduleAppointment = (email, name, message, phone, link) => __awaiter(void 0, void 0, void 0, function* () {
    const transporter = _c.config();
    if (email) {
        const mailOptions = {
            from: email,
            to: 'care@pdrealestates.com',
            subject: 'Appointment Scheduled',
            html: (0, schedule_appointment_1.scheduleAppointmentTemplate)(name, email, phone, message, link),
        };
        try {
            yield transporter.sendMail(mailOptions);
            return true;
        }
        catch (error) {
            throw new Error(error.message);
        }
    }
});
EmailService.resetToken = (user, token) => __awaiter(void 0, void 0, void 0, function* () {
    const transporter = _c.config();
    if (user.email) {
        const mailOptions = {
            from: process.env.MAIL_FROM,
            to: user.email,
            subject: 'Password Reset',
            html: (0, password_reset_1.passwordResetTemplate)(`${process.env.SITE_URL}/reset-password/${token}`),
        };
        try {
            yield transporter.sendMail(mailOptions);
            return true;
        }
        catch (error) {
            throw new Error(error.message);
        }
    }
});
