import { Request, Response } from 'express';
import { Appointment } from '../../models/appointment';
import { User } from '../../models/user';
import { NotFoundError } from '../../errors/not-found-error';

const USER = 'user';
const LIST = 'list';

export const getAppointments = async (req: Request, res: Response) => {
  const appointments = await Appointment.find({}).populate([USER, LIST]);
  res.send(appointments);
};

export const find = async (req: Request, res: Response) => {
  const { id } = req.params;
  const appointment = await Appointment.findById(id).populate([USER, LIST]);
  res.send(appointment);
};

export const create = async (req: Request, res: Response) => {
  const { list, name, email, phone, description } = req.body;
  const appointment = Appointment.generate({
    list,
    name,
    email,
    phone,
    description,
  });
  await appointment.save();
  res.status(201).send(appointment);
};

export const update = async (req: Request, res: Response) => {
  const { list, status } = req.body;
  const { id } = req.params;
  const appointment = await Appointment.findOneAndUpdate(
    { _id: id },
    { status },
    {
      new: true,
    }
  );
  res.status(201).send(appointment);
};

export const deleteAppointment = async (req: Request, res: Response) => {
  const { id } = req.params;
  await Appointment.deleteOne({ _id: id });
  res.status(201).send({ message: 'Appointment deleted successfully' });
};
