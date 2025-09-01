import express from "express";
import { Signup, Login, getUser } from "../controllers/userController.js";
import { validateSignup } from "../middlewares/validSignup.js";
import { authenticateToken, isAdmin } from "../middlewares/authorization.js";

const router = express.Router();

// Signup route
router.post("/signup", validateSignup, Signup);
// Login route
router.post("/login", Login, authenticateToken, isAdmin);
// Single user route
router.get("/:id", authenticateToken, getUser);

export default router;
