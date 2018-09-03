import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';
import * as generatePassword from 'xkpasswd/generate';
import { pick } from 'lodash';
import { HttpError } from '../../utils/errors';
import User, { UserI } from './model';
import config from '../../utils/config';
import { log } from 'util';

export interface Token {
  userId: string;
  userCap: string;
}

/**
 * Authentication Methods
 */

export const createToken = (user: UserI) => {
  const { _id: userId, capability: userCap } = user;
  const tokenVars: Token = { userId, userCap };
  return jwt.sign(tokenVars, config.jwtSecret, { expiresIn: 86400 });
};

export const sendUserInfo = (user: UserI) => {
  const { fname, lname, capability, email } = user;
  const token = createToken(user);
  const userInfo = {
    token,
    fname,
    lname,
    capability,
    email,
  };
  return userInfo;
};

export const login = async (req, res) => {
  const { email, password } = pick(req.body, ['email', 'password']);
  if (!email || !password) {
    throw new HttpError('Missing parameters.', 400);
  }
  const user = await User.findOne({ email }).select('+password');
  if (!user) {
    throw new HttpError('No user found.', 404);
  }
  const passwordIsValid = bcrypt.compareSync(password, user.password);
  if (!passwordIsValid) {
    throw new HttpError('Password Incorrect', 401);
  }
  res.json(sendUserInfo(user));
};

export const register = async (req, res) => {
  try {
    const { email, fname, lname, password } = pick(req.body, ['email', 'fname', 'lname', 'password']) as any;
    
    const toCreate = {
      email,
      fname,
      lname,
      password: bcrypt.hashSync(password, 8),
    };
    const user = await User.create(toCreate);
    // templateSender(email, 'auth/register', { fname });
    res.json(sendUserInfo(user));
  } catch ({ message }) {
    throw new HttpError(400, message);
  }
};

export const verify = async (req, res) => {
  const user = await User.findById(req.userId);
  if (!user) {
    throw new HttpError('No user found.', 404);
  }
  res.json(sendUserInfo(user));
};

export const tokenMiddleware = (req, res, next) => {
  if (!req.headers.authorization) {
    throw new HttpError('No token provided.', 403);
  }
  const [, token] = req.headers.authorization.split(' ');
  if (!token) {
    throw new HttpError('No token provided.', 403);
  }
  try {
    const decoded = jwt.verify(token, config.jwtSecret) as Token;
    req.userId = decoded.userId;
    req.userCap = decoded.userCap;
    return next();
  } catch (error) {
    throw new HttpError('Failed to authenticate token.', 403);
  }
};

export const resetPassword = async (req, res) => {
  const { email } = req.body;
  const plainPassword = generatePassword({ separators: '-' });
  const password = bcrypt.hashSync(plainPassword, 8);
  await User.findOneAndUpdate({ email }, { password });
  // templateSender(email, 'auth/resetPassword', { password: plainPassword });
  res.send(
    `Password reset successfully, a new password has been emailed to you at ${email}`
  );
};

/**
 * User CRUD
 */

export const create = async (req, res) => {
  const data = pick(req.body, [
    'email',
    'fname',
    'lname',
    'chapter',
    'capability',
  ]);
  const password = generatePassword({ separators: '-' });
  const hashedPassword = bcrypt.hashSync(password, 8);
  console.log({ data, password });
  const user = await User.create({ ...data, password: hashedPassword });
  // TODO trigger invite email
  res.json(user);
};

export const get = async (req, res) => {
  const { userId } = req.params;
  const user = await User.findById(userId);
  res.json({ user });
};

export const list = async (req, res) => {
  const users = await User.find();
  res.json({ users });
};

export const update = async (req, res) => {
  const { userId } = req.params;
  const { body } = req;
  const updates = pick(body, ['fname', 'lname', 'email']);
  const user = await User.findOneAndUpdate(userId, updates, { new: true });
  res.json({ user });
};

export const remove = async (req, res) => {
  const { userId } = req.params;
  const user = await User.findById(userId);
  if (!user) {
    return res.status(404).send({message: `Could not find user with id "${userId}"`});
  }
  await user.remove();
  return res.status(202).send();
};
