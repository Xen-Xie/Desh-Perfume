/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Button from "../reuse/Button";
import { Link, useNavigate } from "react-router";
import axios from "axios";
import { useAuth } from "../auth/useAuth";
import { useTheme } from "../context/useTheme";

function Login() {
  const { login, user, } = useAuth();
  // Fetching the divisions and districts from the translation files

  //Navigate to the next page
  const navigate = useNavigate();
  const [form, setForm] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  // This will redirect The user to the Home If user is logged in before
  useEffect(() => {
    if (user) {
      navigate("/");
    }
  }, [user, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };
  //Submit the form
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const res = await axios.post(
        "http://0.0.0.0:5000/api/user/login",
        form
      );
      login(res.data.token);
      navigate("/");
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Invalid credentials");
    }
  };
  // Theme Toggle
  const { darkMode } = useTheme();

  return (
    <div className="min-h-screen bg-center font-primary">
      <div className="min-h-screen flex items-center justify-center px-4">
        <motion.div
          initial={{ y: -30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="bg-cardbg shadow-xl backdrop-blur-2xl  p-6 sm:p-8 rounded-2xl"
        >
          {error && (
            <div className="mb-4 p-3 rounded bg-primary/10 text-primary font-semibold border border-primary text-sm">
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
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
              Login
            </h1>

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
                } absolute right-4 top-1/2 -translate-y-1/2 cursor-pointer text-primarytext`}
                onClick={() => setShowPassword((prev) => !prev)}
                tabIndex={-1}
                onMouseDown={(e) => e.preventDefault()}
              ></i>
            </div>

            <Button type="submit" className="w-full font-bold">
              Login
            </Button>

            <p className="text-center text-sm mt-6 text-primarytext">
              Don't Have an Accoount?{" "}
              <Link to="/account" className="text-secondarytext font-semibold hover:underline">
                signup
              </Link>
            </p>
          </form>
        </motion.div>
      </div>
    </div>
  );
}

export default Login;
