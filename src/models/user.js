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
exports.User = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const password_manager_1 = require("../services/password-manager");
const constants_1 = require("../utils/constants");
const userSchema = new mongoose_1.default.Schema({
    firstname: {
        type: String,
        required: true,
    },
    lastname: {
        type: String,
        required: true,
    },
    phone: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: true,
    },
    role: {
        type: Number,
        enum: [constants_1.Roles.USER, constants_1.Roles.ADMIN],
        default: constants_1.Roles.USER,
    },
    isDeleted: {
        type: Boolean,
        default: false,
    },
    is_verified: {
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
            ret.type = ret.role;
            delete ret._id;
            delete ret.password;
            delete ret.__v;
            delete ret.role;
            delete ret.isDeleted;
        },
    },
});
userSchema.static('generate', function generate(attrs) {
    return new User(attrs);
});
userSchema.pre('find', function () {
    this.where({ isDeleted: false });
});
userSchema.pre('findOne', function () {
    this.where({ isDeleted: false });
});
userSchema.pre('save', function (done) {
    return __awaiter(this, void 0, void 0, function* () {
        // we use the function keyword instead of the arrow function since we want our "this" to point to the user
        //using the arrow function will make "this" equal to the context of the entire file
        if (this.isModified('password')) {
            const hash = yield password_manager_1.PasswordManager.toHash(this.get('password')); //get the user's password and pass it to hash
            this.set('password', hash);
        }
        if (this.isModified()) {
            this.set('updated_at', Date.now());
        }
        done();
    });
});
const User = mongoose_1.default.model('User', userSchema);
exports.User = User;
