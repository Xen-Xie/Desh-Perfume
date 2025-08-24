import express from 'express';
import { Signup } from '../controllers/userController.js';
import { validateSignup } from '../middlewares/validSignup.js';


const router = express.Router();

// Signup route
router.post('/signup', Signup, validateSignup);

export default router;
