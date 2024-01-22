"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.homeRouter = void 0;
const express_1 = __importDefault(require("express"));
const home_controller_1 = require("../../controllers/home-controller");
const router = express_1.default.Router();
exports.homeRouter = router;
router.get('/listing/featured', home_controller_1.getFeaturedListing);
router.get('/listing/:id', home_controller_1.getListing);
router.get('/listings', home_controller_1.getListings);
