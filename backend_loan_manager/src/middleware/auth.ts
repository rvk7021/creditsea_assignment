import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { UserDetails } from '../models/userModel';
import { OfficerDetails } from '../models/verifierModel';
import { Admin } from '../models/adminModel';

const JWT_SECRET = process.env.JWT_SECRET || 'defaultsecretkey';

export const authenticateUser = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) {
    res.status(401).json({ message: 'Unauthorized: No token found' });
    return;
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as {
      email: string;
      role: string;
      userId: string;
    };
    const { email, role } = decoded;
    let userDataId;
    switch (role) {
      case 'user': {
        const userDetails = await UserDetails.findOne({ email }); // 👈 changed from userId to email
        if (!userDetails) {
          res.status(404).json({ message: 'UserDetails not found' });
          return;
        }
        console.log('UserDetails found:', userDetails);
        userDataId = userDetails._id;
        break;
      }
      case 'verifier': {
        const officer = await OfficerDetails.findOne({ email });
        if (!officer) {
          res.status(404).json({ message: 'OfficerDetails not found' });
          return;
        }
        // console.log('OfficerDetails found:', officer);
        userDataId = officer._id;
        break;
      }
      case 'admin': {
        const admin = await Admin.findOne({ email });
        if (!admin) {
          res.status(404).json({ message: 'Admin not found' });
          return;
        }
        userDataId = admin._id;
        break;
      }
      default:
        res.status(403).json({ message: 'Invalid user role' });
        return;
    }

    // Attach user context to request
    (req as any).user = {
      role,
      email,
      userId: userDataId,
    };

    next();
  } catch (error) {
    console.error('JWT error:', error);
    res.status(401).json({ message: 'Unauthorized: Invalid token' });
  }
};
