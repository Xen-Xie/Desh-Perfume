import express from 'express';
import { Signup, Login } from '../controllers/userController.js';
import { validateSignup } from '../middlewares/validSignup.js';
import { authenticateToken } from '../middlewares/authorization.js';


const router = express.Router();

// Signup route
router.post('/signup', Signup, validateSignup);
router.post('/login', Login, authenticateToken);

export default router;
