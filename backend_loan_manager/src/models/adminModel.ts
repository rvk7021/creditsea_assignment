import mongoose, { Schema, Document } from 'mongoose';

export interface IAdmin extends Document {
    username: string;
    password: string;
    role: 'admin';
    name: string;
    email: string;
    signupDate: Date;
    createdAt: Date;
    updatedAt: Date;
}

const AdminSchema: Schema<IAdmin> = new Schema(
    {
        username: { type: String, required: true, unique: true },
        password: { type: String, required: true },
        role: { type: String, required: true, default: 'admin' },
        name: { type: String, required: true },
        email: { type: String, required: true, unique: true },
        signupDate: { type: Date, default: Date.now },
    },
    { timestamps: true }
);

export const Admin = mongoose.model<IAdmin>('Admin', AdminSchema);
