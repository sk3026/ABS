import Account from '../models/Account.js';
import { v4 as uuidv4 } from 'uuid';

export class AccountController {
  static async createAccount(req, res, next) {
    try {
      const { accountType, currency } = req.body;

      const account = new Account({
        accountNumber: `ACC-${uuidv4().slice(0, 8)}`,
        userId: req.user.userId,
        accountType: accountType || 'CHECKING',
        currency: currency || 'USD',
      });

      await account.save();
      res.status(201).json(account);
    } catch (error) {
      next(error);
    }
  }

  static async getAccounts(req, res, next) {
    try {
      const accounts = await Account.find({ userId: req.user.userId });
      res.json(accounts);
    } catch (error) {
      next(error);
    }
  }

  static async getAccount(req, res, next) {
    try {
      const { accountId } = req.params;
      const account = await Account.findById(accountId);

      if (!account || account.userId.toString() !== req.user.userId) {
        return res.status(404).json({ error: 'Account not found' });
      }

      res.json(account);
    } catch (error) {
      next(error);
    }
  }
}
