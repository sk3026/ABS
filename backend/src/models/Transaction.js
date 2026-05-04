import mongoose from 'mongoose';

const transactionSchema = new mongoose.Schema(
  {
    idempotencyKey: {
      type: String,
      required: true,
      unique: true,
      index: true,
      sparse: true,
    },
    fromAccountId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Account',
      required: true,
      index: true,
    },
    toAccountId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Account',
      required: true,
      index: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    fromLedgerEntry: {
      type: {
        type: String,
        enum: ['DEBIT', 'CREDIT'],
        required: true,
      },
      amount: {
        type: Number,
        required: true,
      },
    },
    toLedgerEntry: {
      type: {
        type: String,
        enum: ['DEBIT', 'CREDIT'],
        required: true,
      },
      amount: {
        type: Number,
        required: true,
      },
    },
    status: {
      type: String,
      enum: ['PENDING', 'COMPLETED', 'FAILED', 'ROLLED_BACK'],
      default: 'PENDING',
      index: true,
    },
    description: String,
    initiatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    failureReason: String,
  },
  { timestamps: true }
);

// Prevent updates and deletes
transactionSchema.pre('findByIdAndUpdate', function (next) {
  throw new Error('Updates not allowed - append-only design');
});

transactionSchema.pre('findByIdAndDelete', function (next) {
  throw new Error('Deletes not allowed - append-only design');
});

export default mongoose.model('Transaction', transactionSchema);
