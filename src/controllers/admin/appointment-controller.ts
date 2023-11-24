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
  const { list, date, userId, description } = req.body;
  const user = await User.findById(userId);
  if(!user) throw new NotFoundError("User not found");
  const appointment = Appointment.generate({
    list,
    user: user._id,
    date,
    description
  });
  await appointment.save();
  res.status(201).send(appointment);
};

export const update = async (req: Request, res: Response) => {
  const { list, date, userId, description } = req.body;
  const { id } = req.params;
  const user = await User.findById(userId);
  if(!user) throw new NotFoundError("User not found");
  const appointment = await Appointment.findOneAndUpdate(
    { _id: id },
    { list, user: user._id, date, description },
    {
      new: true,
    }
  );
  res.status(201).send(appointment);
};

export const deleteAppointment = async (req: Request, res: Response) => {
  const { id } = req.params;
  await Appointment.deleteOne({_id: id});
  res.status(201).send({ message: 'Appointment deleted successfully' });
};
