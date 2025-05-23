import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IUserDetails extends Document {
    name: string;
    email: string;
    password: string;
    user: Types.ObjectId;
    contactNumber: string;
    address: string;
    assignedOfficer: Types.ObjectId | null;
    loans: {
        loanApplication: Types.ObjectId;
        amount: number;
        status: 'pending' | 'approved' | 'rejected' | 'repaid';
        createdAt: Date;
        dueDate: Date;
        remainingAmount: number;
    }[];
    transactions: {
        amount: number;
        date: Date;
        type: 'deposit' | 'repayment';
        loanId?: Types.ObjectId;
    }[];
}

const UserDetailsSchema: Schema<IUserDetails> = new Schema(
    {
        name: { type: String, required: true },
        email: { type: String, required: true, unique: true },
        password: { type: String, required: true },

        user: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
        contactNumber: { type: String, required: true },
        address: { type: String, required: true },
        assignedOfficer: { type: Schema.Types.ObjectId, ref: 'OfficerDetails' },

        loans: [
            {
                loanApplication: { type: Schema.Types.ObjectId, ref: 'LoanApplication', required: true },
                amount: { type: Number, required: true },
                status: { type: String, enum: ['pending', 'approved', 'rejected', 'repaid'], default: 'pending' },
                createdAt: { type: Date, default: Date.now },
                dueDate: { type: Date, required: true },
                remainingAmount: { type: Number, required: true },
            },
        ],

        transactions: [
            {
                amount: { type: Number, required: true },
                date: { type: Date, default: Date.now },
                type: { type: String, enum: ['deposit', 'repayment'], required: true },
                loanId: { type: Schema.Types.ObjectId },
            },
        ],
    },
    { timestamps: true }
);

export const UserDetails = mongoose.model<IUserDetails>('UserDetails', UserDetailsSchema);
