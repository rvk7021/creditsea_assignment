import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import { OfficerDetails } from '../models/verifierModel';
import { User } from '../models/user';
export const createOfficerProfile = async (req: Request, res: Response): Promise<void> => {
    try {
        const { employeeId, name, contactNumber, designation, email, password } = req.body;

        // Validate required fields
        if (!employeeId || !name || !contactNumber || !email || !password) {
            res.status(400).json({ message: 'Missing required fields (employeeId, name, contactNumber, email, password).' });
            return;
        }

        // Prevent duplicate officer profiles by employeeId or email
        const [existingOfficerById, existingOfficerByEmail] = await Promise.all([
            OfficerDetails.findOne({ employeeId }),
            OfficerDetails.findOne({ email }),
        ]);

        if (existingOfficerById) {
            res.status(400).json({ message: 'Officer with this employee ID already exists.' });
            return;
        }

        if (existingOfficerByEmail) {
            res.status(400).json({ message: 'Officer with this email already exists.' });
            return;
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = await User.create({
            name,
            email,
            password: hashedPassword,
            role: 'verifier'
        });
        // Create officer profile
        const officerProfile = new OfficerDetails({
            employeeId,
            name,
            contactNumber,
            designation: designation || 'Loan Officer',
            email,
            password: hashedPassword,
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
            officer: {
                _id: officerProfile._id,
                employeeId: officerProfile.employeeId,
                name: officerProfile.name,
                email: officerProfile.email,
                designation: officerProfile.designation,
                contactNumber: officerProfile.contactNumber
            }
        });
    } catch (error: any) {
        console.error('Error in createOfficerProfile:', error);
        res.status(500).json({ message: 'Server error', error: error?.message || error });
    }
};
