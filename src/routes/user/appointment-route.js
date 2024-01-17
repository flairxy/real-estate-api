"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.userAppointmentRouter = void 0;
const express_1 = __importDefault(require("express"));
const appointment_controller_1 = require("../../controllers/user/appointment-controller");
const express_validator_1 = require("express-validator");
const validate_request_1 = require("../../middlewares/validate-request");
const router = express_1.default.Router();
exports.userAppointmentRouter = router;
const validator = [
    (0, express_validator_1.body)('name').notEmpty().withMessage('Name is required'),
    (0, express_validator_1.body)('email').notEmpty().withMessage('Email is required'),
    (0, express_validator_1.body)('phone').notEmpty().withMessage('Phone is required'),
    (0, express_validator_1.body)('description').notEmpty().withMessage('Message is required'),
];
// router.get(
//   '/user/appointments',
//   auth,
//   getAppointments
// );
// router.get(
//   '/user/appointment/:id',
//   auth,
//   find
// );
router.post('/user/appointment/create', validator, validate_request_1.validateRequest, appointment_controller_1.create);
