import express from 'express';
import { signupUser } from '../controllers/userSignUp';

const router = express.Router(); 

router.post('/signup', signupUser);

export default router;
