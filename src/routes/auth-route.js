"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authRouter = void 0;
const express_1 = __importDefault(require("express"));
const express_validator_1 = require("express-validator");
const auth_controller_1 = require("../controllers/auth/auth-controller");
const validate_request_1 = require("../middlewares/validate-request");
const authenticated_1 = require("../middlewares/authenticated");
const router = express_1.default.Router();
exports.authRouter = router;
const registerValidator = [
    (0, express_validator_1.body)('email').isEmail().withMessage('Email must be valid'),
    (0, express_validator_1.body)('phone').notEmpty().withMessage('Phone is required'),
    (0, express_validator_1.body)('firstname').notEmpty().withMessage('Firstname is required'),
    (0, express_validator_1.body)('lastname').notEmpty().withMessage('Lastname is required'),
    (0, express_validator_1.body)('password')
        .trim()
        .isLength({ min: 4, max: 20 })
        .withMessage('Password must be between 4 and 20 characters'),
];
const loginValidator = [
    (0, express_validator_1.body)('email').isEmail().withMessage('Email must be valid'),
    (0, express_validator_1.body)('password').trim().notEmpty().withMessage('Password is required'),
];
const passwordValidor = [
    (0, express_validator_1.body)('password').trim().notEmpty().withMessage('Password is required'),
    (0, express_validator_1.body)('oldPassword').trim().notEmpty().withMessage('Old password is required'),
];
router.get('/', (req, res) => {
    res.send('API Running...');
});
router.get('/current-user', authenticated_1.auth, auth_controller_1.authUser);
router.post('/register', registerValidator, validate_request_1.validateRequest, auth_controller_1.register);
router.post('/login', loginValidator, validate_request_1.validateRequest, auth_controller_1.login);
router.post('/reset-token', [(0, express_validator_1.body)('email').isEmail().withMessage('Email must be valid')], validate_request_1.validateRequest, auth_controller_1.resetToken);
router.post('/:token/reset-password', [(0, express_validator_1.body)('password').trim().notEmpty().withMessage('Password is required')], validate_request_1.validateRequest, auth_controller_1.resetPassword);
router.post('/update-password', passwordValidor, validate_request_1.validateRequest, authenticated_1.auth, auth_controller_1.updatePassword);
router.post('/logout', auth_controller_1.logout);
router.post('/verification/refresh', authenticated_1.auth, auth_controller_1.refreshLink);
router.post('/email/verify/:token', authenticated_1.auth, auth_controller_1.verifyEmail);
router.get('/run-jobs', auth_controller_1.runJobs);
