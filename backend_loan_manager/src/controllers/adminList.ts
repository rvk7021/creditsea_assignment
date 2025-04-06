import { UserDetails } from "../models/userModel";
import { OfficerDetails } from "../models/verifierModel";
import { LoanApplication } from "../models/loanApplicationModel";
import { Request, Response } from "express";

export const getAllUsers = async (req: Request, res: Response): Promise<void> => {
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
