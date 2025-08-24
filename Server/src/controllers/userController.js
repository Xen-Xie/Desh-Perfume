import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// Signup a new user
export const Signup = async (req, res) => {
  try {
    const { name, email, password, confirmPassword, role, isAdmin } = req.body;

    // 1. Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // 2. Confirm passwords match (DON’T hash confirmPassword)
    if (password !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match" });
    }

    // 3. Hash password only
    const hashedPassword = await bcrypt.hash(password, 12);

    // 4. Save user without confirmPassword
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      role,
      isAdmin,
    });

    await newUser.save();

    // 5. (Optional) Generate JWT for login right away
    const token = jwt.sign(
      { id: newUser._id, email: newUser.email, role: newUser.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.status(201).json({
      message: "User created successfully",
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        isAdmin: newUser.isAdmin,
      },
      token,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};
