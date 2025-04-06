import express from 'express';
import { signupUser } from '../controllers/userSignUp';
import { submitLoanApplication } from '../controllers/getLoan';
import { getTransactions,getDeposits ,getLoanApplications} from '../controllers/getTransaction';
const router = express.Router(); 

// all user functions
router.post('/signup', signupUser);
router.post('/loan/apply', submitLoanApplication);
router.get('/transactions', getTransactions);
router.get('/transactions/deposits', getDeposits);
router.get('/loan/applications', getLoanApplications);
export default router;
