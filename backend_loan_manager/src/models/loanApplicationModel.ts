import mongoose, { Schema, Document, Types } from 'mongoose';

export interface ILoanApplication extends Document {
  fullName: string;
  loanAmount: number;
  loanTenureMonths: number;
  employmentStatus: string;
  reason: string;
  employmentAddress: string;
  agreedToTerms: boolean;
  user: Types.ObjectId;
}

const LoanApplicationSchema: Schema<ILoanApplication> = new Schema(
  {
    fullName: { type: String, required: true },
    loanAmount: { type: Number, required: true },
    loanTenureMonths: { type: Number, required: true },
    employmentStatus: { type: String, required: true },
    reason: { type: String, required: true },
    employmentAddress: { type: String, required: true },
    agreedToTerms: { type: Boolean, required: true },
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

export const LoanApplication = mongoose.model<ILoanApplication>('LoanApplication', LoanApplicationSchema);
