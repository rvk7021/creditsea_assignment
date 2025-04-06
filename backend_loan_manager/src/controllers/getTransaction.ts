import { Request, Response } from 'express';
import { UserDetails } from '../models/userModel';

// Get all transactions of a user
export const getTransactions = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = '67f24ac84eb6ca864c881005';    //(req as any).userId

        const userDetails = await UserDetails.findOne({ user: userId });

        if (!userDetails) {
            res.status(404).json({ message: 'User details not found' });
            return;
        }

        res.status(200).json({
            message: 'All transactions fetched successfully',
            transactions: userDetails.transactions
        });
    } catch (error) {
        console.error('Error fetching transactions:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Get all deposits of a user
export const getDeposits = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = '67f24ac84eb6ca864c881005';    //(req as any).userId

        const userDetails = await UserDetails.findOne({ user: userId });
        if (!userDetails) {
            res.status(404).json({ message: 'User details not found' });
            return;
        }
        const depositTransactions = userDetails.transactions.filter(tx => tx.type === 'deposit');
        res.status(200).json({
            message: 'Deposit transactions fetched successfully',
            deposits: depositTransactions
        });
    } catch (error) {
        console.error('Error fetching deposit transactions:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Fetch all loan applications from the user's record
export const getLoanApplications = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = '67f24ac84eb6ca864c881005';    //(req as any).userId

        const userDetails = await UserDetails.findOne({ user: userId })
            .populate('loans.loanApplication')
            .populate('assignedOfficer', 'name');

        if (!userDetails) {
            res.status(404).json({ message: 'User details not found' });
            return;
        }

        const officerName = userDetails.assignedOfficer
            ? (userDetails.assignedOfficer as any).name
            : 'Not Assigned';

        // Directly construct the new array
        const loansWithOfficer = userDetails.loans.map((loan) => ({
            loanApplication: loan.loanApplication,
            amount: loan.amount,
            status: loan.status,
            createdAt: loan.createdAt,
            dueDate: loan.dueDate,
            remainingAmount: loan.remainingAmount,
            officerName
        }));

        res.status(200).json({
            message: 'Loan applications with officer name fetched successfully',
            loans: loansWithOfficer
        });

    } catch (error) {
        console.error('Error fetching loans with officer:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};