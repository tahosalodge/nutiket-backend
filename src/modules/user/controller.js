const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const generatePassword = require('xkpasswd');
const config = require('utils/config');
const createError = require('utils/createError');
const User = require('./model');

class UserController {
  constructor() {
    this.model = User;
  }

  /**
   * Utility to create JWT
   * @param {User} user
   */
  static createToken(user) {
    const { _id: userId, capability: userCap } = user;
    const tokenVars = { userId, userCap };
    return jwt.sign(tokenVars, config.jwtSecret, { expiresIn: 86400 });
  }

  /**
   * Utility to set user response object
   * @param {User} user
   */
  static sendUserInfo(user) {
    const { fname, lname, capability, email, chapter, unit } = user;
    const token = UserController.createToken(user);
    const userInfo = {
      token,
      fname,
      lname,
      capability,
      email,
      chapter,
      unit,
    };
    return userInfo;
  }

  async login(req, res) {
    const { email, password } = req.body;
    if (!email || !password) {
      throw createError('Missing parameters.', 400);
    }
    const user = await this.user.findOne({ email });
    if (!user) {
      throw createError('No user found.', 404);
    }
    const passwordIsValid = bcrypt.compareSync(password, user.password);
    if (!passwordIsValid) {
      throw createError('Password Incorrect', 401);
    }
    res.json(UserController.sendUserInfo(user));
  }

  async register(req, res) {
    try {
      const { email, fname, lname, chapter, password, capability } = req.body;
      const toCreate = {
        email,
        fname,
        lname,
        chapter,
        capability,
        password: bcrypt.hashSync(password, 8),
      };
      const user = await this.user.create(toCreate);
      // templateSender(email, 'auth/register', { fname });
      res.json(UserController.sendUserInfo(user));
    } catch ({ message }) {
      throw createError(400, message);
    }
  }

  async me(req, res) {
    const user = await this.user.findById(req.userId, { password: 0 });
    if (!user) {
      throw createError('No user found.', 404);
    }
    res.json(UserController.sendUserInfo(user));
  }

  static async tokenMiddleware(req, res, next) {
    try {
      if (!req.headers.authorization) {
        throw createError('No token provided.', 403);
      }
      const token = req.headers.authorization.split(' ')[1];
      if (!token) {
        throw createError('No token provided.', 403);
      }
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.userId = decoded.userId;
        req.userCap = decoded.userCap;
        return next();
      } catch (error) {
        throw createError('Failed to authenticate token.', 403);
      }
    } catch ({ code, message }) {
      return res.status(code).send({ message });
    }
  }

  async updateUser(userId, patch) {
    const updatedUser = await this.user.findOneAndUpdate(
      { _id: userId },
      patch
    );
    return updatedUser;
  }

  async getUser(userId) {
    return this.user.findById(userId);
  }

  async generateUser(data) {
    const password = generatePassword({ separators: '-' });
    const hashedPassword = bcrypt.hashSync(password, 8);
    const user = await this.user.create({ ...data, password: hashedPassword });
    user.plainPass = password;
    return user;
  }

  async resetPassword(req, res) {
    const { email } = req.body;
    const plainPassword = generatePassword({ separators: '-' });
    const password = bcrypt.hashSync(plainPassword, 8);
    await this.user.findOneAndUpdate({ email }, { password });
    // templateSender(email, 'auth/resetPassword', { password: plainPassword });
    res.send(
      `Password reset successfully, a new password has been emailed to you at ${email}`
    );
  }

  async getUsers(req, res) {
    const users = await this.user.find();
    res.json(users);
  }
}

module.exports = UserController;
