import mongoose, { Schema, Document, Types } from 'mongoose';

export interface ILoanApplication extends Document {
    user: Types.ObjectId;
    fullName: string;
    loanAmount: number;
    loanTenureMonths: number;
    employmentStatus: string;
    reason: string;
    employmentAddress: string;
    agreedToTerms: boolean;
    status: 'approved' | 'rejected' | 'pending' | 'repaid';
    repaidAmount: number;  // Add this field for repaid amount
}

const LoanApplicationSchema: Schema<ILoanApplication> = new Schema(
    {
        user: { type: Schema.Types.ObjectId, ref: 'UserDetails' },
        fullName: { type: String, required: true },
        loanAmount: { type: Number, required: true },
        loanTenureMonths: { type: Number, required: true },
        employmentStatus: { type: String, required: true },
        reason: { type: String, required: true },
        employmentAddress: { type: String, required: true },
        agreedToTerms: { type: Boolean, required: true },
        status: { type: String, enum: ['approved', 'rejected', 'pending', 'repaid'], required: false, default: 'pending' },
        repaidAmount: { type: Number, default: 0 }, // Field for repaid amount
    },
    { timestamps: true }
);

export const LoanApplication = mongoose.model<ILoanApplication>('LoanApplication', LoanApplicationSchema);
