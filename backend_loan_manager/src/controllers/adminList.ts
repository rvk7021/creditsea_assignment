import { UserDetails } from "../models/userModel";
import { OfficerDetails } from "../models/verifierModel";
import { LoanApplication } from "../models/loanApplicationModel";
import { Request, Response } from "express";
import { Admin } from "../models/adminModel";

export const getAllUsers = async (req: Request, res: Response): Promise<void> => {
    const userId = (req as any).user.userId;
    const checkAdmin = await Admin.findById(userId);
    if (!checkAdmin) {
        res.status(403).json({ message: "Unauthorized access" });
        return;
    }
    try {
        const users = await UserDetails.find(); 
        res.status(200).json({
            message: "All users fetched successfully",
            users
        });
    } catch (error) {
        console.error("Error fetching users:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const getAllOfficers = async (req: Request, res: Response): Promise<void> => {
    const userId = (req as any).user.userId;
    const checkAdmin = await Admin.findById(userId);
    if (!checkAdmin) {
        res.status(403).json({ message: "Unauthorized access" });
        return;
    }
    try {
        const officers = await OfficerDetails.find(); 
        res.status(200).json({
            message: "All officers fetched successfully",
            officers
        });
    } catch (error) {
        console.error("Error fetching officers:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const getAllLoanApplications = async (req: Request, res: Response): Promise<void> => {
    const userId = (req as any).user.userId;
    const checkAdmin = await Admin.findById(userId);
    if (!checkAdmin) {
        res.status(403).json({ message: "Unauthorized access" });
        return;
    }
    try {
        const applications = await LoanApplication.find();
        res.status(200).json({
            message: "All loan applications fetched successfully",
            applications
        });
    } catch (error) {
        console.error("Error fetching loan applications:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const getMetrics = async (req: Request, res: Response): Promise<void> => {
    const userId = (req as any).user.userId;
    const checkAdmin = await Admin.findById(userId);
    if (!checkAdmin) {
        res.status(403).json({ message: "Unauthorized access" });
        return;
    }
    let totalUsers = 0;
    let totalOfficers = 0;
    let totalLoanApplications = 0;
    let totalApprovedLoans = 0;
    let totalRejectedLoans = 0;
    let totalPendingLoans = 0;
    let totalRepaidLoans = 0;
    let totalCashdisbursements = 0;
    let totalCashRecieved = 0;
    let totalBorrowers = 0;
    const applications = await LoanApplication.find();
    const users = await UserDetails.find();
    const officers = await OfficerDetails.find();
    totalUsers = users.length;
    totalOfficers = officers.length;
    totalLoanApplications = applications.length;
    totalApprovedLoans = applications.filter(app => app.status === 'approved').length;
    totalRejectedLoans = applications.filter(app => app.status === 'rejected').length;
    totalPendingLoans = applications.filter(app => app.status === 'pending').length;
    totalRepaidLoans = applications.filter(app => app.status === 'repaid').length;
    totalCashdisbursements = applications.reduce((acc, app) => acc + app.loanAmount, 0);
    totalCashRecieved = applications.reduce((acc, app) => acc + app.repaidAmount, 0);
    totalBorrowers = applications.filter(app => app.status === 'approved' || app.status === 'repaid').length;
    res.status(200).json({
        message: "Metrics fetched successfully",
        metrics: {
            totalUsers,
            totalOfficers,
            totalLoanApplications,
            totalApprovedLoans,
            totalRejectedLoans,
            totalPendingLoans,
            totalRepaidLoans,
            totalCashdisbursements,
            totalCashRecieved,
            totalBorrowers
        }
    });
}

export const getAdminList = async (req: Request, res: Response): Promise<void> => {
    const userId = (req as any).user.userId;
    const checkAdmin = await Admin.findById(userId);
    if (!checkAdmin) {
        res.status(403).json({ message: "Unauthorized access" });
        return;
    }
    try {
        const admins = await Admin.find(); 
        if (!admins || admins.length === 0) {
            res.status(404).json({ message: "No admins found" });
            return;
        }
        const filteredAdmins = admins.filter(admin => admin.id !== userId);
        if (filteredAdmins.length === 0) {
            res.status(404).json({ message: "No other admins found" });
            return;
        }
        const Newadmins = filteredAdmins;
        res.status(200).json({
            message: "All admins fetched successfully",
            Newadmins
        });
    } catch (error) {
        console.error("Error fetching admins:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}

export const removeAdmin = async (req: Request, res: Response): Promise<void> => {
    const userId = (req as any).user.userId;
    const checkAdmin = await Admin.findById(userId);
    if (!checkAdmin) {
        res.status(403).json({ message: "Unauthorized access" });
        return;
    }
    const adminId = req.params.adminId; // Assuming adminId is passed in the request body
    try {
        const admin = await Admin.findByIdAndDelete(adminId);
        if (!admin) {
            res.status(404).json({ message: "Admin not found" });
            return;
        }
        res.status(200).json({
            message: "Admin deleted successfully",
            admin
        });
    } catch (error) {
        console.error("Error deleting admin:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}

export const approveReject =async (req: Request, res: Response): Promise<void> => {
    const {applicationId, action} = req.body;
    if(!applicationId || !action) {
        res.status(400).json({ message: "Missing required fields (applicationId, action)." });
        return;
    }
    if(action !== 'approved' && action !== 'rejected') {
        res.status(400).json({ message: "Invalid action. Use 'approved' or 'rejected'." });
        return;
    }
    try {
        const application = await LoanApplication.findById(applicationId);
        if (!application) {
            res.status(404).json({ message: "Loan application not found" });
            return;
        }
        application.status = action;
        if (action === 'approved') {
            application.loanAmount = application.loanAmount;
        } else if (action === 'rejected') {
            application.loanAmount = 0;
        }
        await application.save();
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

        res.status(200).json({
            message: "Loan application updated successfully",
            application
        });
        
    } catch (error) {
        console.error("Error approving/rejecting loan application:", error);
        res.status(500).json({ message: "Internal server error" });
        
    }
}