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
exports.deleteAppointment = exports.update = exports.create = exports.find = exports.getAppointments = void 0;
const appointment_1 = require("../../models/appointment");
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
    const { list, name, email, phone, description } = req.body;
    const appointment = appointment_1.Appointment.generate({
        list,
        name,
        email,
        phone,
        description,
    });
    yield appointment.save();
    res.status(201).send(appointment);
});
exports.create = create;
const update = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { list, status } = req.body;
    const { id } = req.params;
    const appointment = yield appointment_1.Appointment.findOneAndUpdate({ _id: id }, { status }, {
        new: true,
    });
    res.status(201).send(appointment);
});
exports.update = update;
const deleteAppointment = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    yield appointment_1.Appointment.deleteOne({ _id: id });
    res.status(201).send({ message: 'Appointment deleted successfully' });
});
exports.deleteAppointment = deleteAppointment;
