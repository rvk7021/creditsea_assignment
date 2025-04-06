import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import { Admin } from '../models/adminModel';
import { User } from '../models/user';
const signupAdmin = async (req: Request, res: Response): Promise<void> => {
    try {
        const { username, password, name, email } = req.body;

        if (!username || !password || !name || !email) {
            res.status(400).json({ message: 'Please provide all required fields (username, password, name, email)' });
            return;
        }

        const existingAdmin = await Admin.findOne({ $or: [{ username }, { email }] });
        if (existingAdmin) {
            res.status(400).json({ message: 'Username or Email already exists' });
            return;
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        const newUser = await User.create({
            name,
            email,
            password: hashedPassword,
            role: 'admin',
        });
        const newAdmin = new Admin({
            username,
            password: hashedPassword,
            name,
            email,
        });

        await newAdmin.save();

        res.status(201).json({
            message: 'Admin account created successfully!',
            admin: {
                username: newAdmin.username,
                name: newAdmin.name,
                email: newAdmin.email,
            },
        });
    } catch (error) {
        console.error('Error creating admin account:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export { signupAdmin };
