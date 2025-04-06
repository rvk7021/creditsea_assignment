import { Request, Response } from 'express';
import { OfficerDetails } from '../models/verifierModel';

export const createOfficerProfile = async (req: Request, res: Response): Promise<void> => {
    try {
        const { employeeId, name, contactNumber, designation } = req.body;

        // Validate required fields
        if (!employeeId || !name || !contactNumber) {
            res.status(400).json({ message: 'Missing required fields.' });
            return;
        }

        // Prevent duplicate officer profiles
        const existingOfficer = await OfficerDetails.findOne({ employeeId });
        if (existingOfficer) {
            res.status(400).json({ message: 'Officer with this employee ID already exists.' });
            return;
        }

        // Create officer profile
        const officerProfile = new OfficerDetails({
            employeeId,
            name,
            contactNumber,
            designation: designation || 'Loan Officer',
            assignedUsers: [],
            verifiedApplications: [],
            metrics: {
                totalApplications: 0,
                totalBorrowers: 0,
                totalDisbursedAmount: 0,
                totalRepaidAmount: 0,
                pendingApplications: 0,
                completedApplications: 0,
                repaidApplications: 0,
            }
        });

        await officerProfile.save();

        res.status(201).json({
            message: 'Officer profile created successfully.',
            officerProfile
        });
    } catch (error: any) {
        console.error('Error in createOfficerProfile:', error);
        res.status(500).json({ message: 'Server error', error: error?.message || error });
    }
};
