"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.multerUpload = void 0;
const multer_1 = __importDefault(require("multer"));
const upload = (0, multer_1.default)({
    limits: {
        fileSize: 10000000, //1mb
    },
    fileFilter(req, file, cb) {
        if (!file.originalname.match(/\.(jpg|jpeg|png)$/) && !file.originalname.match(/\.(mp4|3gp|avi|WebM)$/)) {
            return cb(new Error('Please upload a valid image or video file'));
        }
        cb(null, true);
    },
});
exports.multerUpload = upload;
