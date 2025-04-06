import express from 'express';
import { signupUser } from '../controllers/userSignUp';
import { submitLoanApplication } from '../controllers/getLoan';
import { getTransactions, getDeposits, getLoanApplications } from '../controllers/getTransaction';
import { createOfficerProfile } from '../controllers/verifierSignUp';
import { updateOfficerMetrics, approveOrRejectLoan } from '../controllers/officerFunction';
import { signupAdmin } from '../controllers/adminSignUp';
import { getAllUsers, getAllOfficers, getAllLoanApplications, getMetrics } from '../controllers/adminList';
const router = express.Router();

// all user functions
router.post('/signup', signupUser);
router.post('/loan/apply', submitLoanApplication);
router.get('/transactions', getTransactions);
router.get('/transactions/deposits', getDeposits);
router.get('/loan/applications', getLoanApplications);

// all functions for officer
router.post('/officer/signup', createOfficerProfile);
router.get('/officer/update-metrics', updateOfficerMetrics);
router.post('/officer/action', approveOrRejectLoan);

// all functions for admin
router.post('/admin/signup', signupAdmin);
router.get('/admin/users', getAllUsers);
router.get('/admin/officers', getAllOfficers);
router.get('/admin/loan-applications', getAllLoanApplications);
router.get('/admin/metrics', getMetrics);
export default router;


