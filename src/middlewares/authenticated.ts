import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { NotAuthorizedError } from '../errors/not-authorized-error';
import { User } from '../models/user';

interface UserPayload {
  id: string;
  email: string;
}

//here we're adding an additionalproperty to an interface (Request interface)
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      currentUser?: UserPayload;
    }
  }
}

export const auth = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const token = req.headers['x-access-token'] as string;
  if (!token) {
    throw new NotAuthorizedError();
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_KEY!) as UserPayload;
    const user = await User.findById(payload.id);
    if (!user) {
      throw new NotAuthorizedError();
    }
    req.currentUser = payload;
  } catch (error) {
    error;
  }
  next();
};
