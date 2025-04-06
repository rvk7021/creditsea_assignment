import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IOfficerDetails extends Document {
    employeeId: string;
    name: string;
    contactNumber: string;
    email: string;
    password: string;
    designation: string;
    assignedUsers: Types.ObjectId[];
    verifiedApplications: {
        application: Types.ObjectId;
        status: 'approved' | 'rejected' | 'pending' | 'repaid';
        decisionDate: Date;
        note?: string;
    }[];
    metrics: {
        totalApplications: number;
        totalBorrowers: number;
        totalDisbursedAmount: number;
        totalRepaidAmount: number;
        pendingApplications: number;
        completedApplications: number;
        repaidApplications: number;
    };
}

const OfficerDetailsSchema: Schema<IOfficerDetails> = new Schema(
    {
        employeeId: { type: String, required: true, unique: true },
        name: { type: String, required: true },
        contactNumber: { type: String, required: true },

        email: { type: String, required: true, unique: true },
        password: { type: String, required: true },

        designation: { type: String, default: 'Loan Officer' },

        assignedUsers: [{ type: Schema.Types.ObjectId, ref: 'UserDetails' }],

        verifiedApplications: [
            {
                application: { type: Schema.Types.ObjectId, ref: 'LoanApplication' },
                status: { type: String, enum: ['approved', 'rejected', 'pending', 'repaid'], required: true },
                decisionDate: { type: Date, default: Date.now },
                note: { type: String },
            }
        ],

        metrics: {
            totalApplications: { type: Number, default: 0 },
            totalBorrowers: { type: Number, default: 0 },
            totalDisbursedAmount: { type: Number, default: 0 },
            totalRepaidAmount: { type: Number, default: 0 },
            pendingApplications: { type: Number, default: 0 },
            completedApplications: { type: Number, default: 0 },
            repaidApplications: { type: Number, default: 0 },
        }
    },
    { timestamps: true }
);

export const OfficerDetails = mongoose.model<IOfficerDetails>('OfficerDetails', OfficerDetailsSchema);
