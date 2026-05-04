import { TransactionService } from '../services/TransactionService.js';
import { EmailService } from '../services/EmailService.js';
import Account from '../models/Account.js';
import User from '../models/User.js';
import { v4 as uuidv4 } from 'uuid';

export class TransactionController {
  static async transfer(req, res, next) {
    try {
      const { fromAccountId, toAccountId, amount, description } = req.body;
      const idempotencyKey = req.headers['idempotency-key'] || uuidv4();

      if (!fromAccountId || !toAccountId || !amount) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      if (amount <= 0) {
        return res.status(400).json({ error: 'Amount must be positive' });
      }

      const { transaction, isRetry } = await TransactionService.transfer(
        fromAccountId,
        toAccountId,
        amount,
        idempotencyKey,
        req.user.userId,
        description
      );

      if (transaction.status === 'COMPLETED') {
        const fromAccount = await Account.findById(fromAccountId);
        const toAccount = await Account.findById(toAccountId);
        const user = await User.findById(req.user.userId);

        await EmailService.sendTransferAlert(
          user.email,
          user.firstName,
          fromAccount.accountNumber,
          toAccount.accountNumber,
          amount
        );
      } else if (transaction.status === 'FAILED') {
        const user = await User.findById(req.user.userId);
        await EmailService.sendFailureAlert(user.email, user.firstName, transaction.failureReason);
      }

      res.status(isRetry ? 200 : 201).json({
        transaction,
        message: isRetry ? 'Idempotent retry - same transaction' : 'Transfer completed',
      });
    } catch (error) {
      next(error);
    }
  }

  static async getBalance(req, res, next) {
    try {
      const { accountId } = req.params;
      const balance = await TransactionService.getBalance(accountId);
      res.json({ accountId, balance });
    } catch (error) {
      next(error);
    }
  }

  static async getHistory(req, res, next) {
    try {
      const { accountId } = req.params;
      const { limit = 50, skip = 0 } = req.query;
      const transactions = await TransactionService.getTransactionHistory(
        accountId,
        parseInt(limit),
        parseInt(skip)
      );
      res.json({ transactions });
    } catch (error) {
      next(error);
    }
  }
}
