import Transaction from '../models/Transaction.js';
import Account from '../models/Account.js';
import mongoose from 'mongoose';

export class TransactionService {
  static async transfer(fromAccountId, toAccountId, amount, idempotencyKey, userId, description) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // Check if idempotency key already exists
      const existing = await Transaction.findOne({ idempotencyKey }, null, { session });
      if (existing) {
        await session.abortTransaction();
        return { transaction: existing, isRetry: true };
      }

      // Fetch accounts with lock (using session)
      const fromAccount = await Account.findById(fromAccountId).session(session);
      const toAccount = await Account.findById(toAccountId).session(session);

      if (!fromAccount || !toAccount) {
        throw new Error('Account not found');
      }

      if (fromAccount.status !== 'ACTIVE' || toAccount.status !== 'ACTIVE') {
        throw new Error('One or both accounts are not active');
      }

      // Create double-entry transaction
      const transaction = new Transaction({
        idempotencyKey,
        fromAccountId,
        toAccountId,
        amount,
        fromLedgerEntry: {
          type: 'DEBIT',
          amount,
        },
        toLedgerEntry: {
          type: 'CREDIT',
          amount,
        },
        status: 'COMPLETED',
        initiatedBy: userId,
        description,
      });

      await transaction.save({ session });
      await session.commitTransaction();

      return { transaction, isRetry: false };
    } catch (error) {
      await session.abortTransaction();

      // Log failed transaction
      const failedTransaction = new Transaction({
        idempotencyKey,
        fromAccountId,
        toAccountId,
        amount,
        fromLedgerEntry: { type: 'DEBIT', amount },
        toLedgerEntry: { type: 'CREDIT', amount },
        status: 'FAILED',
        initiatedBy: userId,
        failureReason: error.message,
      });

      await failedTransaction.save();
      throw error;
    } finally {
      await session.endSession();
    }
  }

  static async getBalance(accountId) {
    const result = await Transaction.aggregate([
      {
        $match: {
          $or: [
            { fromAccountId: new mongoose.Types.ObjectId(accountId), status: 'COMPLETED' },
            { toAccountId: new mongoose.Types.ObjectId(accountId), status: 'COMPLETED' },
          ],
        },
      },
      {
        $facet: {
          debits: [
            {
              $match: { fromAccountId: new mongoose.Types.ObjectId(accountId) },
            },
            {
              $group: {
                _id: null,
                total: { $sum: '$amount' },
              },
            },
          ],
          credits: [
            {
              $match: { toAccountId: new mongoose.Types.ObjectId(accountId) },
            },
            {
              $group: {
                _id: null,
                total: { $sum: '$amount' },
              },
            },
          ],
        },
      },
      {
        $project: {
          balance: {
            $subtract: [
              { $arrayElemAt: ['$credits.total', 0] },
              { $arrayElemAt: ['$debits.total', 0] },
            ],
          },
        },
      },
    ]);

    return result[0]?.balance || 0;
  }

  static async getTransactionHistory(accountId, limit = 50, skip = 0) {
    return await Transaction.find({
      $or: [{ fromAccountId: accountId }, { toAccountId: accountId }],
      status: 'COMPLETED',
    })
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip)
      .populate('fromAccountId toAccountId initiatedBy');
  }
}
