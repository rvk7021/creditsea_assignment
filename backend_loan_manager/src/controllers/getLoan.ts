import { Request, Response } from 'express';
import { LoanApplication } from '../models/loanApplicationModel';
import { UserDetails } from '../models/userModel';
import { OfficerDetails } from '../models/verifierModel';

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

        const userId = '67f27133e1a99ed123dc1a36'; // Replace with actual auth user id later
        if (!userId) {
            res.status(401).json({ message: 'Unauthorized: user ID not found.' });
            return;
        }

        // Check if user has agreed to the terms
        if (!agree) {
            res.status(400).json({ message: 'You must agree to the terms and conditions.' });
            return;
        }

        // Validate required fields
        if (!fullName || !amount || !tenureInMonths || !employmentStatus || !reason || !employmentAddress) {
            res.status(400).json({ message: 'All fields are required.' });
            return;
        }

        // Create loan application
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

        // Calculate due date
        const dueDate = new Date();
        dueDate.setMonth(dueDate.getMonth() + Number(tenureInMonths));

        // Update UserDetails with loan information
        const userDetails = await UserDetails.findOneAndUpdate(
            { user: userId },
            {
                $push: {
                    loans: {
                        loanApplication: application._id,
                        amount,
                        status: 'pending',
                        dueDate,
                        remainingAmount: amount * (1 + 0.09),
                        createdAt: new Date()
                    }
                }
            },
            { new: true }
        );

        if (!userDetails) {
            res.status(404).json({ message: 'User details not found' });
            return;
        }

        // If an officer is assigned, add application to officer's verifiedApplications
        if (userDetails?.assignedOfficer) {
            await OfficerDetails.findOneAndUpdate(
                { _id: userDetails.assignedOfficer }, // Updated query here
                {
                    $push: {
                        verifiedApplications: {
                            application: application._id,
                            status: 'pending',
                            decisionDate: new Date(),
                            note: 'Application submitted, awaiting review.'
                        }
                    }
                }
            );
            console.log('Officer notified of new application:', userDetails.assignedOfficer);
        }

        res.status(201).json({
            message: 'Loan application submitted successfully',
            applicationId: application._id
        });

    } catch (error) {
        console.error('Loan application error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
