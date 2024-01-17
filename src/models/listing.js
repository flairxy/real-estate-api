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
exports.Listing = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const constants_1 = require("../utils/constants");
const listingSchema = new mongoose_1.default.Schema({
    title: {
        type: String,
        required: true,
    },
    currency: {
        type: String,
        default: 'NGN',
    },
    description: {
        type: String,
        required: true,
    },
    images: {
        type: [
            {
                type: mongoose_1.default.Schema.Types.ObjectId,
                ref: 'Upload',
            },
        ],
        required: true,
    },
    type: {
        type: Number,
        required: true,
    },
    code: {
        type: String,
    },
    country: {
        type: String,
    },
    state: {
        type: String,
    },
    category: {
        type: String,
        required: true,
    },
    accessories: {
        type: mongoose_1.default.Schema.Types.Mixed,
    },
    coordinate: {
        type: mongoose_1.default.Schema.Types.Mixed,
    },
    landmarks: {
        type: [mongoose_1.default.Schema.Types.Mixed],
    },
    price: {
        type: Number,
        required: true,
    },
    address: {
        type: String,
        required: true,
    },
    status: {
        type: Number,
        default: constants_1.ListingStatus.PENDING,
    },
    featured: {
        type: Boolean,
        default: false,
    },
    locked: {
        type: Boolean,
        default: false,
    },
    locked_at: {
        type: Date,
        default: Date.now(),
    },
    locked_by: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        required: false,
    },
    created_at: {
        type: Date,
        default: Date.now(),
    },
    updated_at: {
        type: Date,
        default: Date.now(),
    },
}, {
    //here we're defining how our response will look like.
    toJSON: {
        transform(doc, ret) {
            ret.id = ret._id;
            delete ret._id;
            delete ret.__v;
            ret.videos = ret.images.filter((img) => img.resource_type === 'video');
            ret.images = ret.images.filter((img) => img.resource_type === 'image');
        },
    },
    statics: {
        generate(attrs) {
            return new Listing(attrs);
        },
    },
});
listingSchema.pre('save', function (done) {
    return __awaiter(this, void 0, void 0, function* () {
        if (this.isModified()) {
            this.set('updated_at', Date.now());
        }
        done();
    });
});
const Listing = mongoose_1.default.model('Listing', listingSchema);
exports.Listing = Listing;
