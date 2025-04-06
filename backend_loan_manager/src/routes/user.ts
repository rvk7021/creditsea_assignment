import express from 'express';
import { signupUser } from '../controllers/userSignUp';
import { submitLoanApplication } from '../controllers/getLoan';
import { getTransactions,getDeposits ,getLoanApplications} from '../controllers/getTransaction';
import { createOfficerProfile } from '../controllers/verifierSignUp';
import { updateOfficerMetrics,approveOrRejectLoan } from '../controllers/officerFunction';
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
export default router;


