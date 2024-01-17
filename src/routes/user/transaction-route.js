"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.userTransactionRouter = void 0;
const express_1 = __importDefault(require("express"));
const transaction_controller_1 = require("../../controllers/user/transaction-controller");
const authenticated_1 = require("../../middlewares/authenticated");
const router = express_1.default.Router();
exports.userTransactionRouter = router;
router.post('/user/transaction/:id/create', authenticated_1.auth, transaction_controller_1.create);
router.get('/user/listings', authenticated_1.auth, transaction_controller_1.getListing);
router.post('/user/transactions', authenticated_1.auth, transaction_controller_1.getTransactions);
router.post('/user/transaction/:reference/verify', transaction_controller_1.verify);
