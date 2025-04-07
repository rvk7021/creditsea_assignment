import { OfficerDetails } from '../models/verifierModel';
import { LoanApplication } from '../models/loanApplicationModel';
import { Request, Response } from 'express';
import { User } from '../models/user';
import { UserDetails } from '../models/userModel';

const updateOfficerMetrics = async (req: Request, res: Response): Promise<void> => {
    const officerId = (req as any).user.userId;
    console.log(officerId, 'officer id from token');
    try {
        const officer = await OfficerDetails.findById(officerId).populate('verifiedApplications.application');

        if (!officer) {
            res.status(404).json({ message: 'Officer not found' });
            return;
        }

        let totalApplications = officer.verifiedApplications.length;
        let totalBorrowers = officer.assignedUsers.length;
        let totalDisbursedAmount = 0;
        let totalRepaidAmount = 0;
        let pendingApplications = 0;
        let completedApplications = 0;
        let repaidApplications = 0;

        for (const applicationRecord of officer.verifiedApplications) {
            const loanApplicationId = applicationRecord.application;

            const loanApplication = await LoanApplication.findById(loanApplicationId);

            if (!loanApplication) continue;

            if (applicationRecord.status === 'approved') {
                totalDisbursedAmount += loanApplication.loanAmount;
                completedApplications++;

                if (loanApplication.repaidAmount === loanApplication.loanAmount) {
                    totalRepaidAmount += loanApplication.repaidAmount;
                    await LoanApplication.findByIdAndUpdate(loanApplicationId, {
                        $set: { status: 'repaid' },
                    });
                    repaidApplications++;
                }
            } else if (applicationRecord.status === 'pending') {
                pendingApplications++;
            }
        }

        await OfficerDetails.findByIdAndUpdate(officerId, {
            $set: {
                'metrics.totalApplications': totalApplications,
                'metrics.totalBorrowers': totalBorrowers,
                'metrics.totalDisbursedAmount': totalDisbursedAmount,
                'metrics.totalRepaidAmount': totalRepaidAmount,
                'metrics.pendingApplications': pendingApplications,
                'metrics.completedApplications': completedApplications,
                'metrics.repaidApplications': repaidApplications,
            },
        });
        res.status(200).json({
            message: 'Officer metrics updated successfully',
            metrics: {
                totalApplications,
                totalBorrowers,
                totalDisbursedAmount,
                totalRepaidAmount,
                pendingApplications,
                completedApplications,
                repaidApplications,
            },
        });

    } catch (error) {
        console.error('Error updating officer metrics:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export { updateOfficerMetrics };

export const approveOrRejectLoan = async (req: Request, res: Response): Promise<void> => {
    const officerId = (req as any).user.userId;
    const { applicationId, action, note } = req.body;

    if (!applicationId || !action || !officerId) {
        res.status(400).json({ message: 'Missing required fields (applicationId, action, or officerId).' });
        return;
    }

    if (action !== 'approved' && action !== 'rejected') {
        res.status(400).json({ message: 'Invalid action. Use "approved" or "rejected".' });
        return;
    }

    try {
        const officer = await OfficerDetails.findById(officerId);
        if (!officer) {
            res.status(404).json({ message: 'Officer not found.' });
            return;
        }

        const application = await LoanApplication.findById(applicationId);
        if (!application) {
            res.status(404).json({ message: 'Loan application not found.' });
            return;
        }

        const officerApplication = officer.verifiedApplications.find(
            (app) => app.application.toString() === applicationId
        );

        if (!officerApplication) {
            res.status(403).json({ message: 'Officer is not assigned to this loan application.' });
            return;
        }

        application.status = action;

        if (action === 'approved') {
            application.loanAmount = application.loanAmount;
        }

        if (action === 'rejected') {
            application.loanAmount = 0;
        }

        await application.save();

        await OfficerDetails.findOneAndUpdate(
            { _id: officerId, 'verifiedApplications.application': applicationId },
            {
                $set: {
                    'verifiedApplications.$.status': action,
                    'verifiedApplications.$.decisionDate': new Date(),
                    'verifiedApplications.$.note': note || 'No note provided.',
                },
            }
        );
        const user = await UserDetails.findOne({ user: application.user });
        if (!user) {
            res.status(404).json({ message: 'User not found for this loan application.' });
            return;
        }
        const loanIndex = user.loans.findIndex(
            (loan) => loan.loanApplication && loan.loanApplication.toString() === applicationId.toString()
        );

        if (loanIndex !== -1) {
            const loanToUpdate = user.loans[loanIndex];

            if (!loanToUpdate.loanApplication) {
                console.error('LoanApplication is missing!');
                return;  
            }

            user.loans[loanIndex] = {
                ...loanToUpdate,
                status: action,
                remainingAmount: loanToUpdate.remainingAmount,
                dueDate: loanToUpdate.dueDate,
                amount: loanToUpdate.amount,
                loanApplication: loanToUpdate.loanApplication
            };

            await user.save();
        } else {
            console.log('Loan not found');
        }

        console.log(loanIndex, 'loan index found');
        res.status(200).json({ message: `Loan application ${action} successfully`, application });

    } catch (error) {
        console.error('Error approving or rejecting loan:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const getLoanApplicationsList = async (req: Request, res: Response): Promise<void> => {
    const officerId = (req as any).user.userId; // req.user.userId
    try {
        const officer = await OfficerDetails.findById(officerId).populate('verifiedApplications.application');

        if (!officer) {
            res.status(404).json({ message: 'Officer not found' });
            return;
        }
        const applications = officer.verifiedApplications.map((app) => app.application);
        res.status(200).json({ applications });
    } catch (error) {
        console.error('Error fetching loan applications:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}