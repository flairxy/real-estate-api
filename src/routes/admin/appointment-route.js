"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminAppointmentRouter = void 0;
const express_1 = __importDefault(require("express"));
const appointment_controller_1 = require("../../controllers/admin/appointment-controller");
const express_validator_1 = require("express-validator");
const validate_request_1 = require("../../middlewares/validate-request");
const admin_1 = require("../../middlewares/admin");
const authenticated_1 = require("../../middlewares/authenticated");
const router = express_1.default.Router();
exports.adminAppointmentRouter = router;
const validator = [
    (0, express_validator_1.body)('list').notEmpty().withMessage('List is required'),
    (0, express_validator_1.body)('date').notEmpty().withMessage('Date is required'),
];
router.get('/admin/appointments', authenticated_1.auth, admin_1.admin, appointment_controller_1.getAppointments);
router.get('/admin/appointment/:id', authenticated_1.auth, admin_1.admin, appointment_controller_1.find);
router.post('/admin/appointment/create', authenticated_1.auth, admin_1.admin, validator, validate_request_1.validateRequest, appointment_controller_1.create);
router.post('/admin/appointment/:id/update', authenticated_1.auth, admin_1.admin, validator, validate_request_1.validateRequest, appointment_controller_1.update);
router.post('/admin/appointment/:id/cancel', authenticated_1.auth, admin_1.admin, appointment_controller_1.deleteAppointment);
