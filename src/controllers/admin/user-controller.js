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
Object.defineProperty(exports, "__esModule", { value: true });
exports.filter = exports.deleteUsers = exports.removeAdmin = exports.setAdmin = exports.update = exports.find = exports.getAdminUsers = exports.getUsers = void 0;
const user_1 = require("../../models/user");
const constants_1 = require("../../utils/constants");
const getUsers = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const users = yield user_1.User.find({ role: constants_1.Roles.USER });
    res.send(users);
});
exports.getUsers = getUsers;
const getAdminUsers = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const users = yield user_1.User.find({ role: constants_1.Roles.ADMIN });
    res.send(users);
});
exports.getAdminUsers = getAdminUsers;
const find = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const user = yield user_1.User.findById(id);
    res.send(user);
});
exports.find = find;
const update = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { firstname, lastname, phone, email, password } = req.body;
    const { id } = req.params;
    const user = yield user_1.User.findOneAndUpdate({ _id: id }, { firstname, lastname, phone, email, password }, {
        new: true,
    });
    res.status(201).send(user);
});
exports.update = update;
const setAdmin = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { ids } = req.body;
    for (let i = 0; i < ids.length; i++) {
        const user = yield user_1.User.findById(ids[i]);
        if (user) {
            user.role = constants_1.Roles.ADMIN;
            user.save();
        }
    }
    res.status(201).send({ message: 'Updated Successfully' });
});
exports.setAdmin = setAdmin;
const removeAdmin = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { ids } = req.body;
    for (let i = 0; i < ids.length; i++) {
        const user = yield user_1.User.findById(ids[i]);
        if (user) {
            user.role = constants_1.Roles.USER;
            user.save();
        }
    }
    res.status(201).send({ message: 'Updated Successfully' });
});
exports.removeAdmin = removeAdmin;
const deleteUsers = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { ids } = req.body;
    yield user_1.User.deleteMany({ _id: ids });
    res.status(201).send({ message: 'Deleted Successfully' });
});
exports.deleteUsers = deleteUsers;
const filter = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email } = req.body;
    const user = yield user_1.User.find({ email });
    res.send(user);
});
exports.filter = filter;
