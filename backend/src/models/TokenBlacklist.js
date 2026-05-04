import mongoose from 'mongoose';

const tokenBlacklistSchema = new mongoose.Schema(
  {
    token: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: true,
      expires: 0,
    },
  },
  { timestamps: true }
);

export default mongoose.model('TokenBlacklist', tokenBlacklistSchema);
