import { Request, Response } from 'express';
import { LoanApplication } from '../models/loanApplicationModel';
import { UserDetails } from '../models/userModel';

export const submitLoanApplication = async (req: Request, res: Response): Promise<void> => {
    try {
        const {
            fullName,
            amount,
            tenureInMonths,
            employmentStatus,
            reason,
            employmentAddress,
            agree
        } = req.body;

        const userId = '67f24ac84eb6ca864c881005';    //(req as any).userId
        if (!userId) {
            res.status(401).json({ message: 'Unauthorized: user ID not found.' });
            return;
        }

        if (!agree) {
            res.status(400).json({ message: 'You must agree to the terms and conditions.' });
            return;
        }

        if (!fullName || !amount || !tenureInMonths || !employmentStatus || !reason || !employmentAddress) {
            res.status(400).json({ message: 'All fields are required.' });
            return;
        }

        const application = await LoanApplication.create({
            user: userId,
            fullName,
            loanAmount: amount,
            loanTenureMonths: tenureInMonths,
            employmentStatus,
            reason,
            employmentAddress,
            agreedToTerms: agree
        });


        const dueDate = new Date();
        dueDate.setMonth(dueDate.getMonth() + Number(tenureInMonths));

        await UserDetails.findOneAndUpdate(
            { user: userId },
            {
                $push: {
                    loans: {
                        applicationId: application._id,
                        amount,
                        status: 'pending',
                        dueDate,
                        remainingAmount: amount
                    }
                }
            }
        );

        res.status(201).json({
            message: 'Loan application submitted successfully',
            applicationId: application._id
        });

    } catch (error) {
        console.error('Loan application error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
