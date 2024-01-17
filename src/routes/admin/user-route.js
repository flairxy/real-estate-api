"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminUserRouter = void 0;
const express_1 = __importDefault(require("express"));
const express_validator_1 = require("express-validator");
const user_controller_1 = require("../../controllers/admin/user-controller");
const validate_request_1 = require("../../middlewares/validate-request");
const admin_1 = require("../../middlewares/admin");
const authenticated_1 = require("../../middlewares/authenticated");
const router = express_1.default.Router();
exports.adminUserRouter = router;
const validator = [
    (0, express_validator_1.body)('email').isEmail().withMessage('Email must be valid'),
    (0, express_validator_1.body)('phone').notEmpty().withMessage('Phone is required'),
    (0, express_validator_1.body)('firstname').notEmpty().withMessage('Firstname is required'),
    (0, express_validator_1.body)('lastname').notEmpty().withMessage('Lastname is required'),
];
router.get('/admin/users', authenticated_1.auth, admin_1.admin, user_controller_1.getUsers);
router.get('/admin/users/admin', authenticated_1.auth, admin_1.admin, user_controller_1.getAdminUsers);
router.get('/admin/user/:id', authenticated_1.auth, admin_1.admin, user_controller_1.find);
router.post('/admin/users/filter', authenticated_1.auth, admin_1.admin, user_controller_1.filter);
router.post('/admin/users/update/:id', validator, validate_request_1.validateRequest, authenticated_1.auth, admin_1.admin, user_controller_1.update);
router.post('/admin/users/set-role', authenticated_1.auth, admin_1.admin, user_controller_1.setAdmin);
router.post('/admin/users/remove-role', authenticated_1.auth, admin_1.admin, user_controller_1.removeAdmin);
router.post('/admin/users/delete', authenticated_1.auth, admin_1.admin, user_controller_1.deleteUsers);
