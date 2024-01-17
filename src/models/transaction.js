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
exports.Transaction = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const constants_1 = require("../utils/constants");
const transactionSchema = new mongoose_1.default.Schema({
    list: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: 'Listing',
        required: true,
    },
    user: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    amount: {
        type: Number,
        required: true,
    },
    status: {
        type: Number,
        enum: [constants_1.TransactionStatus.PENDING, constants_1.TransactionStatus.COMPLETED],
        default: constants_1.TransactionStatus.PENDING,
    },
    reference: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
    },
    code: {
        type: String,
        required: false,
    },
    txId: {
        type: String,
        required: false,
    },
    isTransfer: {
        type: Boolean,
        default: false,
    },
    isDeleted: {
        type: Boolean,
        default: false,
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
            delete ret.isDeleted;
        },
    },
    statics: {
        generate(attrs) {
            return new Transaction(attrs);
        },
    },
});
transactionSchema.pre('save', function (done) {
    return __awaiter(this, void 0, void 0, function* () {
        if (this.isModified()) {
            this.set('updated_at', Date.now());
        }
        done();
    });
});
transactionSchema.pre('find', function () {
    this.where({ isDeleted: false });
});
transactionSchema.pre('findOne', function () {
    this.where({ isDeleted: false });
});
const Transaction = mongoose_1.default.model('Transaction', transactionSchema);
exports.Transaction = Transaction;
