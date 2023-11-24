import { Request, Response } from 'express';
import { User } from '../../models/user';
import { Roles } from '../../utils/constants';

export const getUsers = async (req: Request, res: Response) => {
  const users = await User.find({ role: Roles.USER });
  res.send(users);
};

export const getAdminUsers = async (req: Request, res: Response) => {
  const users = await User.find({ role: Roles.ADMIN });
  res.send(users);
};

export const find = async (req: Request, res: Response) => {
  const { id } = req.params;
  const user = await User.findById(id);
  res.send(user);
};

export const update = async (req: Request, res: Response) => {
  const { firstname, lastname, phone, email, password } = req.body;
  const { id } = req.params;
  const user = await User.findOneAndUpdate(
    { _id: id },
    { firstname, lastname, phone, email, password },
    {
      new: true,
    }
  );
  res.status(201).send(user);
};

export const setAdmin = async (req: Request, res: Response) => {
  const { ids } = req.body;
  for (let i = 0; i < ids.length; i++) {
    const user = await User.findById(ids[i]);
    if (user) {
      user.role = Roles.ADMIN;
      user.save();
    }
  }
  res.status(201).send({message: 'Updated Successfully'});
};

export const removeAdmin = async (req: Request, res: Response) => {
  const { ids } = req.body;
  for (let i = 0; i < ids.length; i++) {
    const user = await User.findById(ids[i]);
    if (user) {
      user.role = Roles.USER;
      user.save();
    }
  }
  res.status(201).send({message: 'Updated Successfully'});
};

export const deleteUsers = async (req: Request, res: Response) => {
  const { ids } = req.body;
  await User.deleteMany({ _id: ids });
  res.status(201).send({message: 'Deleted Successfully'});
};

export const filter = async (req: Request, res: Response) => {
  const { email } = req.body;
  const user = await User.find({ email });
  res.send(user);
};
