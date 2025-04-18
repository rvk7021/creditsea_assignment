import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { User } from '../models/user';
import cookieParser from 'cookie-parser';

const JWT_SECRET = process.env.JWT_SECRET || 'defaultsecretkey';

export const loginUser = async (req: Request, res: Response): Promise<void> => {
    try {
        const { email, password ,role} = req.body;

        if (!email || !password) {
            res.status(400).json({ message: 'Email and password are required.' });
            return;
        }
        const user = await User.findOne({ email,role });
        if (!user) {
            res.status(401).json({ message: 'Invalid email or password.' });
            return;
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            res.status(401).json({ message: 'Invalid email or password.' });
            return;
        }

        // Sign JWT with userId, email, and role
        const token = jwt.sign(
            {
                userId: user._id,
                email: user.email,
                role
            },
            JWT_SECRET,
            { expiresIn: '2h' }
        );

        res
        .cookie('token', token, {
          httpOnly: true,
          secure: false, // set to true in production with HTTPS
          sameSite: 'lax', // or 'None' with secure: true
          maxAge: 2 * 60 * 60 * 25*1000, // 2 hours
        })
        .status(200)
        .json({ message: 'Login successful' ,token});
      
    } catch (error: any) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Internal server error', error: error?.message || error });
    }
};
