"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminTransactionRouter = void 0;
const express_1 = __importDefault(require("express"));
const controller = __importStar(require("../../controllers/admin/transactions-controller"));
const admin_1 = require("../../middlewares/admin");
const authenticated_1 = require("../../middlewares/authenticated");
const router = express_1.default.Router();
exports.adminTransactionRouter = router;
router.get('/admin/transactions', authenticated_1.auth, admin_1.admin, controller.getTransactions);
router.get('/admin/transaction/:id', authenticated_1.auth, admin_1.admin, controller.find);
router.post('/admin/transaction/:id/verify', authenticated_1.auth, admin_1.admin, controller.verify);
router.post('/admin/transaction/:id/complete', authenticated_1.auth, admin_1.admin, controller.markAsCompleted);
router.post('/admin/transaction/:id/pending', authenticated_1.auth, admin_1.admin, controller.markAsPending);
router.post('/admin/transactions/delete', authenticated_1.auth, admin_1.admin, controller.deleteTransactions);
router.post('/admin/transactions', authenticated_1.auth, admin_1.admin, controller.filter);
