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
exports.app = void 0;
const express_1 = __importDefault(require("express"));
require("express-async-errors");
const body_parser_1 = require("body-parser");
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const cookie_session_1 = __importDefault(require("cookie-session"));
const error_handler_1 = require("./middlewares/error-handler");
const not_found_error_1 = require("./errors/not-found-error");
const morgan_1 = require("./middlewares/morgan");
// Routes
const auth_route_1 = require("./routes/auth-route");
const transaction_route_1 = require("./routes/user/transaction-route");
const appointment_route_1 = require("./routes/user/appointment-route");
const listing_route_1 = require("./routes/user/listing-route");
const user_route_1 = require("./routes/admin/user-route");
const listing_route_2 = require("./routes/admin/listing-route");
const transaction_route_2 = require("./routes/admin/transaction-route");
const appointment_route_2 = require("./routes/admin/appointment-route");
dotenv_1.default.config();
const app = (0, express_1.default)();
exports.app = app;
app.use(morgan_1.morganMiddleware);
app.set('trust proxy', true); //for nginx
app.use((0, body_parser_1.json)({ limit: '30mb' }));
app.use((0, cookie_session_1.default)({
    signed: false,
    secure: process.env.NODE_ENV === 'production',
}));
app.use((0, cors_1.default)());
app.use('/api', auth_route_1.authRouter);
app.use('/api', transaction_route_1.userTransactionRouter);
app.use('/api', appointment_route_1.userAppointmentRouter);
app.use('/api', listing_route_2.adminListRouter);
app.use('/api', user_route_1.adminUserRouter);
app.use('/api', appointment_route_2.adminAppointmentRouter);
app.use('/api', transaction_route_2.adminTransactionRouter);
app.use('/api', listing_route_1.homeRouter);
app.all('*', () => __awaiter(void 0, void 0, void 0, function* () {
    throw new not_found_error_1.NotFoundError('Route not found');
}));
app.use(error_handler_1.errorHandler);
