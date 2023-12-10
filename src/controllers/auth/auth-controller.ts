import { Request, Response } from 'express';
import { BadRequestError } from '../../errors/bad-request-error';
import { User } from '../../models/user';
import jwt from 'jsonwebtoken';
import { PasswordManager } from '../../services/password-manager';
import { Roles } from '../../utils/constants';
import { EmailService } from '../../services';
import { Token } from '../../models/token';
import { randomBytes } from 'crypto';
import mongoose from 'mongoose';
import { NotFoundError } from '../../errors/not-found-error';

export const authUser = async (req: Request, res: Response) => {
  res.send({ currentUser: req.currentUser || null });
};

export const register = async (req: Request, res: Response) => {
  const session = await mongoose.startSession();

  session.startTransaction();
  try {
    const { firstname, lastname, phone, email, password } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new BadRequestError('Email in use');
    }
    const user = User.generate({
      firstname,
      lastname,
      phone,
      email,
      password,
      role: Roles.USER,
    });
    await user.save();
    const tokenGen = randomBytes(20).toString('hex');
    const token = Token.generate({ user: user._id, token: tokenGen });
    await token.save();
    const emailSent = await EmailService.verifyEmail(user, tokenGen);
    if (!emailSent) throw new Error('Verification mail not sent');
    await session.commitTransaction();
    session.endSession();
    res.status(201).send({ message: 'Verify Email' });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const existingUser = await User.findOne({ email });
  if (!existingUser) {
    throw new BadRequestError('Invalid credentials');
  }
  const passwordMatch = await PasswordManager.compare(
    existingUser.password,
    password
  );
  if (!passwordMatch) {
    throw new BadRequestError('Invalid credentials');
  }
  const token = jwt.sign(
    {
      id: existingUser.id,
      email: existingUser.email,
      phone: existingUser.phone,
      firstname: existingUser.firstname,
      lastname: existingUser.lastname,
      type: existingUser.role,
      is_verified: existingUser.is_verified,
    },
    process.env.JWT_KEY! //the ! afer process.env.JWT_KEY is to stop typescript warning
  );
  console.log(existingUser.role);
  // req.session = { token: userJwt };
  res.status(200).send({ data: existingUser, token });
};

export const logout = async (req: Request, res: Response) => {
  req.session = null;
  res.send({});
};

export const updatePassword = async (req: Request, res: Response) => {
  const { password, oldPassword } = req.body;
  const user = await User.findById(req.currentUser?.id);
  if (!user) throw new NotFoundError();

  //matches old password
  const passwordMatch = await PasswordManager.compare(
    user.password,
    oldPassword
  );
  const samePassword = await PasswordManager.compare(user.password, password);
  if (samePassword) {
    throw new BadRequestError('Password cannot be same as old password');
  }
  if (!passwordMatch) {
    throw new BadRequestError('Invalid credentials');
  }
  user.password = password;
  await user.save();
  res.status(201).send({ message: 'Password updated successfully' });
};

export const resetToken = async (req: Request, res: Response) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) throw new BadRequestError('User not found');
    const tokenGen = randomBytes(20).toString('hex');
    const token = Token.generate({ user: user._id, token: tokenGen });
    await token.save();
    const emailSent = await EmailService.resetToken(user, tokenGen);
    if (!emailSent) throw new Error('Reset mail not sent');
    await session.commitTransaction();
    session.endSession();
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};

export const verifyEmail = async (req: Request, res: Response) => {
  const user = await User.findById(req.currentUser?.id);
  if (!user) throw new NotFoundError();
  const token = await Token.findOne({
    user: user._id,
    toekn: req.params.token,
  });
  if (!token || (token && new Date(Date.now()) > new Date(token.expires)))
    throw new BadRequestError('Token Invalid or expired');
  await token.deleteOne({ _id: token.id });
  user.is_verified = true;
  await user.save();
  const userJwt = jwt.sign(
    {
      id: user.id,
      email: user.email,
      phone: user.phone,
      firstname: user.firstname,
      lastname: user.lastname,
      type: user.role,
      is_verified: user.is_verified,
    },
    process.env.JWT_KEY!
  );
  req.session = { token: userJwt };
  res.status(201).send(user);
};

export const resetPassword = async (req: Request, res: Response) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { password } = req.body;
    const token_ = req.params;
    const token = await Token.findOne({ token: token_ });
    if (!token) throw new NotFoundError();
    const user = await User.findById(token.user);
    if (!user) throw new NotFoundError();
    if (!token || (token && new Date(Date.now()) > new Date(token.expires)))
      throw new BadRequestError('Token Invalid or expired');
    await token.deleteOne({ _id: token.id });
    user.password = password;
    await user.save();
    res.status(201).send({ message: 'Password reset successfully' });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};
