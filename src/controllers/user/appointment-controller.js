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
exports.cancelAppointment = exports.update = exports.create = exports.find = exports.getAppointments = void 0;
const appointment_1 = require("../../models/appointment");
const user_1 = require("../../models/user");
const not_authorized_error_1 = require("../../errors/not-authorized-error");
const services_1 = require("../../services");
const USER = 'user';
const LIST = 'list';
const getAppointments = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const appointments = yield appointment_1.Appointment.find({}).populate([USER, LIST]);
    res.send(appointments);
});
exports.getAppointments = getAppointments;
const find = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const appointment = yield appointment_1.Appointment.findById(id).populate([USER, LIST]);
    res.send(appointment);
});
exports.find = find;
const create = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { list, description, name, phone, email } = req.body;
    const appointment = appointment_1.Appointment.generate({
        list,
        name,
        phone,
        email,
        description,
    });
    yield appointment.save();
    const link = `${process.env.SITE_URL}/list/${list}`;
    yield services_1.EmailService.scheduleAppointment(email, name, description, phone, link);
    res.status(201).send(appointment);
});
exports.create = create;
const update = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const user = yield user_1.User.findById((_a = req.currentUser) === null || _a === void 0 ? void 0 : _a.id);
    if (!user)
        throw new not_authorized_error_1.NotAuthorizedError();
    const { list, date, description } = req.body;
    const { id } = req.params;
    const appointment = yield appointment_1.Appointment.findOneAndUpdate({ _id: id, user: user._id }, { list, user: user._id, date, description }, {
        new: true,
    });
    res.status(201).send(appointment);
});
exports.update = update;
const cancelAppointment = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _b;
    const { id } = req.params;
    const user = yield user_1.User.findById((_b = req.currentUser) === null || _b === void 0 ? void 0 : _b.id);
    if (!user)
        throw new not_authorized_error_1.NotAuthorizedError();
    yield appointment_1.Appointment.deleteOne({ _id: id, user: user._id });
    res.status(201).send({ message: 'Appointment cancelled successfully' });
});
exports.cancelAppointment = cancelAppointment;
