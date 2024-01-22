"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminListRouter = void 0;
const express_1 = __importDefault(require("express"));
const express_validator_1 = require("express-validator");
const listing_controller_1 = require("../../controllers/admin/listing-controller");
const validate_request_1 = require("../../middlewares/validate-request");
const admin_1 = require("../../middlewares/admin");
const multer_1 = require("../../middlewares/multer");
const authenticated_1 = require("../../middlewares/authenticated");
const router = express_1.default.Router();
exports.adminListRouter = router;
const createValidator = [
    (0, express_validator_1.body)('title').notEmpty().withMessage('Title is required'),
    (0, express_validator_1.body)('address').notEmpty().withMessage('Address is required'),
    (0, express_validator_1.body)('country').notEmpty().withMessage('Country is required'),
    (0, express_validator_1.body)('state').notEmpty().withMessage('State is required'),
    (0, express_validator_1.body)('description').notEmpty().withMessage('Description is required'),
    (0, express_validator_1.body)('category').notEmpty().withMessage('Category is required'),
    (0, express_validator_1.body)('type').isInt().notEmpty().withMessage('List type is required'),
    (0, express_validator_1.body)('status').isInt().notEmpty().withMessage('Status type is required'),
    (0, express_validator_1.body)('price').isInt().notEmpty().withMessage('Price is required'),
];
router.get('/admin/listing', authenticated_1.auth, admin_1.admin, listing_controller_1.getListings);
router.get('/admin/listing/:id', authenticated_1.auth, admin_1.admin, listing_controller_1.find);
router.post('/admin/listing/filter', authenticated_1.auth, admin_1.admin, listing_controller_1.filter);
router.post('/admin/listing/resource-upload/:id', authenticated_1.auth, admin_1.admin, multer_1.multerUpload.single('file'), validate_request_1.validateRequest, listing_controller_1.uploadResource);
router.post('/admin/listing/create', authenticated_1.auth, admin_1.admin, createValidator, validate_request_1.validateRequest, listing_controller_1.create);
router.post('/admin/listing/update/:id', authenticated_1.auth, admin_1.admin, createValidator, validate_request_1.validateRequest, listing_controller_1.update);
router.post('/admin/listing/delete/:id', authenticated_1.auth, admin_1.admin, listing_controller_1.deleteListing);
router.post('/admin/listing/resource/delete', authenticated_1.auth, admin_1.admin, listing_controller_1.deleteResource);
router.post('/admin/listing/featured/:id', authenticated_1.auth, admin_1.admin, listing_controller_1.updateFeaturedStatus);
