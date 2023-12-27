import { Request, Response } from 'express';
import { Appointment } from '../../models/appointment';
import { User } from '../../models/user';
import { NotAuthorizedError } from '../../errors/not-authorized-error';
import { NotFoundError } from '../../errors/not-found-error';
import { EmailService } from '../../services';

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
  const { list, description, name, phone, email } = req.body;
  const appointment = Appointment.generate({
    list,
    name,
    phone,
    email,
    description,
  });
  await appointment.save();
  const link = `${process.env.SITE_URL}/list/${list}`;
  await EmailService.scheduleAppointment(email, name, description, phone, link);
  res.status(201).send(appointment);
};

export const update = async (req: Request, res: Response) => {
  const user = await User.findById(req.currentUser?.id);
  if (!user) throw new NotAuthorizedError();
  const { list, date, description } = req.body;
  const { id } = req.params;
  const appointment = await Appointment.findOneAndUpdate(
    { _id: id, user: user._id },
    { list, user: user._id, date, description },
    {
      new: true,
    }
  );
  res.status(201).send(appointment);
};

export const cancelAppointment = async (req: Request, res: Response) => {
  const { id } = req.params;
  const user = await User.findById(req.currentUser?.id);
  if (!user) throw new NotAuthorizedError();
  await Appointment.deleteOne({ _id: id, user: user._id });
  res.status(201).send({ message: 'Appointment cancelled successfully' });
};
