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
const express_1 = __importDefault(require("express"));
require("express-async-errors");
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const serverless_http_1 = __importDefault(require("serverless-http"));
const body_parser_1 = require("body-parser");
const mongoose_1 = __importDefault(require("mongoose"));
const error_handler_1 = require("../src/middlewares/error-handler");
const not_found_error_1 = require("../src/errors/not-found-error");
const morgan_1 = require("../src/middlewares/morgan");
// Routes
const auth_route_1 = require("../src/routes/auth-route");
const transaction_route_1 = require("../src/routes/user/transaction-route");
const appointment_route_1 = require("../src/routes/user/appointment-route");
const user_route_1 = require("../src/routes/admin/user-route");
const listing_route_1 = require("../src/routes/admin/listing-route");
const transaction_route_2 = require("../src/routes/admin/transaction-route");
const appointment_route_2 = require("../src/routes/admin/appointment-route");
const listing_route_2 = require("../src/routes/user/listing-route");
dotenv_1.default.config();
const app = (0, express_1.default)();
app.use(morgan_1.morganMiddleware);
app.use((0, body_parser_1.json)({ limit: '30mb' }));
app.use((0, cors_1.default)());
app.use('/.netlify/functions/api', auth_route_1.authRouter);
app.use('/.netlify/functions/api', transaction_route_1.userTransactionRouter);
app.use('/.netlify/functions/api', appointment_route_1.userAppointmentRouter);
app.use('/.netlify/functions/api', listing_route_1.adminListRouter);
app.use('/.netlify/functions/api', user_route_1.adminUserRouter);
app.use('/.netlify/functions/api', appointment_route_2.adminAppointmentRouter);
app.use('/.netlify/functions/api', transaction_route_2.adminTransactionRouter);
app.use('/.netlify/functions/api', listing_route_2.homeRouter);
app.all('*', () => __awaiter(void 0, void 0, void 0, function* () {
    throw new not_found_error_1.NotFoundError('Route not found');
}));
app.use(error_handler_1.errorHandler);
if (!process.env.CLOUDINARY_NAME ||
    !process.env.CLOUDINARY_KEY ||
    !process.env.CLOUDINARY_SECRET) {
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
const handler = (0, serverless_http_1.default)(app);
module.exports.handler = (event, context) => __awaiter(void 0, void 0, void 0, function* () {
    const client = yield mongoose_1.default.connect(process.env.MONGO_URI);
    const result = yield handler(event, context);
    yield client.disconnect();
    return result;
});
