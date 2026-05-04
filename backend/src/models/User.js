import mongoose from 'mongoose';
import bcryptjs from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    firstName: String,
    lastName: String,
    phone: String,
  },
  { timestamps: true }
);

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcryptjs.hash(this.password, 10);
  next();
});

userSchema.methods.comparePassword = async function (password) {
  return await bcryptjs.compare(password, this.password);
};

// Prevent updates and deletes (append-only)
userSchema.pre('findByIdAndUpdate', function (next) {
  throw new Error('Updates not allowed - append-only design');
});

userSchema.pre('findByIdAndDelete', function (next) {
  throw new Error('Deletes not allowed - append-only design');
});

export default mongoose.model('User', userSchema);
