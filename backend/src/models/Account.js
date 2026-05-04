import mongoose from 'mongoose';

const accountSchema = new mongoose.Schema(
  {
    accountNumber: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    accountType: {
      type: String,
      enum: ['CHECKING', 'SAVINGS', 'CREDIT'],
      default: 'CHECKING',
    },
    currency: {
      type: String,
      default: 'USD',
    },
    status: {
      type: String,
      enum: ['ACTIVE', 'FROZEN', 'CLOSED'],
      default: 'ACTIVE',
    },
  },
  { timestamps: true }
);

// Prevent updates and deletes
accountSchema.pre('findByIdAndUpdate', function (next) {
  throw new Error('Updates not allowed - append-only design');
});

accountSchema.pre('findByIdAndDelete', function (next) {
  throw new Error('Deletes not allowed - append-only design');
});

export default mongoose.model('Account', accountSchema);
