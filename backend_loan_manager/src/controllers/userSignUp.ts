import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import { User } from '../models/user';
import { UserDetails } from '../models/userModel';
import { OfficerDetails } from '../models/verifierModel';
export const signupUser = async (req: Request, res: Response): Promise<void> => {
    try {
        const { name, email, password, contactNumber, address } = req.body;

        if (!name || !email || !password || !contactNumber || !address) {
            res.status(400).json({ message: 'All fields are required' });
            return;
        }

        const [existingUser, existingContact] = await Promise.all([
            User.findOne({ email }),
            UserDetails.findOne({ contactNumber }),
        ]);

        if (existingUser) {
            res.status(409).json({ message: 'User already exists with this email' });
            return;
        }

        if (existingContact) {
            res.status(409).json({ message: 'User already exists with this contact number' });
            return;
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = await User.create({
            name,
            email,
            password: hashedPassword,
            role: 'user',
        });

        // 👇 Find a random officer
        let officer = await OfficerDetails.aggregate([{ $sample: { size: 1 } }]);
        if (!officer || officer.length === 0) {
            // 👇 fallback to first officer
            const fallbackOfficer = await OfficerDetails.findOne();
            if (!fallbackOfficer) {
                res.status(500).json({ message: 'No officers available for assignment' });
                return;
            }
            officer = [fallbackOfficer];
        }

        const assignedOfficerId = officer[0]._id;

        await UserDetails.create({
            user: newUser._id,
            name,
            email,
            password: hashedPassword,
            contactNumber,
            address,
            assignedOfficer: assignedOfficerId,
            loans: [],
            transactions: [],
        });

        res.status(201).json({
            message: 'User registered successfully',
            userId: newUser._id,
            assignedOfficer: assignedOfficerId
        });
    } catch (error) {
        console.error('Signup error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
