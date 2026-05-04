import jwt from 'jsonwebtoken';
import { AuthService } from '../services/AuthService.js';

export class AuthController {
  static async register(req, res, next) {
    try {
      const { email, password, firstName, lastName, phone } = req.body;
      const result = await AuthService.register(email, password, firstName, lastName, phone);
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  }

  static async login(req, res, next) {
    try {
      const { email, password } = req.body;
      const result = await AuthService.login(email, password);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  static async logout(req, res, next) {
    try {
      const token = req.headers.authorization?.split(' ')[1];
      const decoded = jwt.decode(token);
      await AuthService.logout(token, decoded.exp - Math.floor(Date.now() / 1000));
      res.json({ message: 'Logged out successfully' });
    } catch (error) {
      next(error);
    }
  }
}
