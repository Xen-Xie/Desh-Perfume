/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router";
import Button from "../reuse/Button";
import { useAuth } from "../auth/useAuth";
import { useTheme } from "../context/useTheme";

function SignUp() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Form state
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  // Error state
  const [errors, setErrors] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  // Success + loading
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  // Redirect if already logged in
  useEffect(() => {
    if (user) navigate("/");
  }, [user, navigate]);

  // Validation
  const isStrongPassword = (pwd) =>
    /^(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/.test(pwd);

  const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  // Handle input + inline validation
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));

    let message = "";
    if (name === "name" && value.trim().length < 3) {
      message = "Name must be at least 3 characters.";
    }
    if (name === "email" && value && !isValidEmail(value)) {
      message = "Invalid email format.";
    }
    if (name === "password" && value && !isStrongPassword(value)) {
      message =
        "Password must be 8+ chars, include 1 uppercase, 1 number, 1 symbol.";
    }
    if (name === "confirmPassword" && value !== form.password) {
      message = "Passwords do not match.";
    }

    setErrors((prev) => ({ ...prev, [name]: message }));
  };

  // Submit form
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.name || !form.email || !form.password || !form.confirmPassword) {
      return alert("All fields are required.");
    }
    if (Object.values(errors).some((msg) => msg)) {
      return alert("Please fix errors before submitting.");
    }

    try {
      setLoading(true);
      const res = await axios.post("https://desh-perfume.onrender.com/api/user/signup", form);

      if (res.data?.success) {
        setSuccess(res.data.message || "Signup successful!");
        setTimeout(() => navigate("/login"), 2000);
      } else {
        alert(res.data?.message || "Signup failed, please try again.");
      }
    } catch (err) {
      console.error(err);
      alert(
        err.response?.data?.message || "An error occurred during registration."
      );
    } finally {
      setLoading(false);
    }
  };

  // Password visibility
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Theme Toggle
  const { darkMode } = useTheme();

  return (
    <div className="min-h-screen bg-center font-primary">
      <div className="min-h-screen flex items-center justify-center px-4">
        <motion.div
          initial={{ y: -30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="bg-cardbg shadow-xl backdrop-blur-2xl max-w-xl p-6 sm:p-8 rounded-2xl w-full"
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex justify-center mb-4">
              <a href="/home">
                {darkMode ? (
                  <img src="/DashLogoD.png" alt="" className="w-15" />
                ) : (
                  <img src="/DashLogo.png" alt="" className="w-15" />
                )}
              </a>
            </div>
            <h1 className="text-center text-2xl font-semibold text-primarytext">
              Sign Up
            </h1>

            {/* Name */}
            <div>
              <input
                type="text"
                name="name"
                placeholder="Name"
                value={form.name}
                onChange={handleChange}
                required
                className="input"
              />
              <div className="h-5 mt-1">
                {errors.name && (
                  <p className="text-xs text-red-500 px-3">{errors.name}</p>
                )}
              </div>
            </div>

            {/* Email */}
            <div>
              <input
                type="email"
                name="email"
                placeholder="Email"
                value={form.email}
                onChange={handleChange}
                required
                className="input"
              />
              <div className="h-5 mt-1">
                {errors.email && (
                  <p className="text-xs text-red-500 px-3">{errors.email}</p>
                )}
              </div>
            </div>

            {/* Password */}
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Password"
                value={form.password}
                onChange={handleChange}
                required
                className="input pr-10"
              />
              <i
                className={`fas ${
                  showPassword ? "fa-eye-slash" : "fa-eye"
                } absolute right-4 top-1/3 -translate-y-1/2 cursor-pointer text-primarytext`}
                onClick={() => setShowPassword((prev) => !prev)}
                tabIndex={-1}
                onMouseDown={(e) => e.preventDefault()}
              ></i>
              <div className="h-5 mt-1">
                {errors.password && (
                  <p className="text-xs text-red-500 px-3">{errors.password}</p>
                )}
              </div>
            </div>

            {/* Confirm Password */}
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                name="confirmPassword"
                placeholder="Confirm Password"
                value={form.confirmPassword}
                onChange={handleChange}
                required
                className="input pr-10"
              />
              <i
                className={`fas ${
                  showConfirmPassword ? "fa-eye-slash" : "fa-eye"
                } absolute right-4 top-1/3 -translate-y-1/2 cursor-pointer text-primarytext`}
                onClick={() => setShowConfirmPassword((prev) => !prev)}
                tabIndex={-1}
                onMouseDown={(e) => e.preventDefault()}
              ></i>
              <div className="h-5 mt-1">
                {errors.confirmPassword && (
                  <p className="text-xs text-red-500 px-3">
                    {errors.confirmPassword}
                  </p>
                )}
              </div>
            </div>

            {/* Submit Button */}
            <div>
              <Button
                type="submit"
                text={loading ? "Signing Up..." : "Sign Up"}
                disabled={loading}
                className="w-full"
              >
                Sign Up
              </Button>
              {success && (
                <p className="text-green-500 text-sm mt-2 text-center">
                  {success}
                </p>
              )}
            </div>
          </form>

          {/* Login link */}
          <p className="text-center text-sm mt-6 text-primarytext">
            Already have an account?{" "}
            <Link to="/login" className="text-secondarytext font-semibold">
              Log In
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}

export default SignUp;
