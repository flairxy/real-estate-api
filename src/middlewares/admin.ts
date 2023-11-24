import { Request, Response, NextFunction } from 'express';
import { NotAuthorizedError } from '../errors/not-authorized-error';
import { User } from '../models/user';
import { Roles } from '../utils/constants';

export const admin = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const currentUser = req.currentUser;
  if (!currentUser) throw new NotAuthorizedError();
  
  const user = await User.findOne({ email: currentUser.email });
  if (user && user.role !== Roles.ADMIN) throw new NotAuthorizedError();

  next();
};
