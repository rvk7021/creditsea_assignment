import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: 'admin' | 'verifier' | 'user';
}

const UserSchema: Schema<IUser> = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: ['admin', 'verifier', 'user'],
      default: 'user',
    },
  },
  { timestamps: true }
);

export const User = mongoose.model<IUser>('User', UserSchema);
