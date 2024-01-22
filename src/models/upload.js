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
exports.Upload = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const uploadSchema = new mongoose_1.default.Schema({
    url: {
        type: String,
        required: true,
    },
    asset_id: {
        type: String,
        required: true,
    },
    public_id: {
        type: String,
        required: true,
    },
    resource_type: {
        type: String,
        required: true,
    },
    created_at: {
        type: Date,
        default: Date.now(),
    },
    updated_at: {
        type: Date,
        default: Date.now(),
    }
}, {
    //here we're defining how our response will look like.
    toJSON: {
        transform(doc, ret) {
            ret.id = ret._id;
            delete ret._id;
            delete ret.__v;
        },
    },
    statics: {
        generate(attrs) {
            return new Upload(attrs);
        },
    },
});
uploadSchema.pre('save', function (done) {
    return __awaiter(this, void 0, void 0, function* () {
        if (this.isModified()) {
            this.set('updated_at', Date.now());
        }
        done();
    });
});
const Upload = mongoose_1.default.model('Upload', uploadSchema);
exports.Upload = Upload;
