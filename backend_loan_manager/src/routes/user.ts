import express from 'express';
import { signupUser } from '../controllers/userSignUp';
import { submitLoanApplication } from '../controllers/getLoan';
import { getTransactions, getDeposits, getLoanApplications } from '../controllers/getTransaction';
import { createOfficerProfile } from '../controllers/verifierSignUp';
import { updateOfficerMetrics, approveOrRejectLoan ,getLoanApplicationsList} from '../controllers/officerFunction';
import { signupAdmin } from '../controllers/adminSignUp';
import { getAllUsers, getAllOfficers, getAllLoanApplications, getMetrics,getAdminList ,removeAdmin,approveReject} from '../controllers/adminList';
import { loginUser } from '../controllers/login';
import { authenticateUser } from '../middleware/auth';
const router = express.Router();
// authentication middleware
router.post('/login', loginUser);
// all user functions
router.post('/signup', signupUser);
router.post('/loan/apply', authenticateUser,submitLoanApplication);
router.get('/transactions',authenticateUser,getTransactions);
router.get('/transactions/deposits',authenticateUser, getDeposits);
router.get('/loan/applications', authenticateUser,getLoanApplications);

// all functions for officer
router.post('/officer/signup', createOfficerProfile);
router.get('/officer/update-metrics',authenticateUser, updateOfficerMetrics);
router.post('/officer/action',authenticateUser, approveOrRejectLoan);
router.get('/officer/loan-applications', authenticateUser,getLoanApplicationsList);

// all functions for admin
router.post('/admin/signup', signupAdmin);
router.get('/admin/users', authenticateUser,getAllUsers);
router.get('/admin/officers', authenticateUser,getAllOfficers);
router.get('/admin/loan-applications',authenticateUser, getAllLoanApplications);
router.get('/admin/metrics',authenticateUser, getMetrics);
router.get('/admin/admin',authenticateUser,getAdminList)
router.delete('/admin/:adminId', authenticateUser, removeAdmin);
router.post('/admin/approve-reject', authenticateUser, approveReject);

export default router;


