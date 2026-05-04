import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import TokenBlacklist from '../models/TokenBlacklist.js';
import { EmailService } from './EmailService.js';

export class AuthService {
  static async register(email, password, firstName, lastName, phone) {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new Error('User already exists');
    }

    const user = new User({ email, password, firstName, lastName, phone });
    await user.save();

    return this.generateToken(user);
  }

  static async login(email, password) {
    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password))) {
      throw new Error('Invalid credentials');
    }

    await EmailService.sendLoginAlert(email, user.firstName);
    return this.generateToken(user);
  }

  static generateToken(user) {
    const token = jwt.sign(
      {
        userId: user._id,
        email: user.email,
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRY }
    );

    return { token, user: { id: user._id, email: user.email, firstName: user.firstName } };
  }

  static async logout(token, expiresIn) {
    const blacklistEntry = new TokenBlacklist({
      token,
      expiresAt: new Date(Date.now() + expiresIn * 1000),
    });
    await blacklistEntry.save();
  }
}
