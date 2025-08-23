/* eslint-disable no-unused-vars */
import { motion } from "framer-motion";
import { Link } from "react-router";
import { cn } from "../config/cn";

const Button = ({ to, children, onClick, className, type = "button" }) => {
  const content = (
    <motion.button
      onClick={onClick}
      whileTap={{ scale: 0.95 }}
      className={cn(
        "relative flex justify-center text-center overflow-hidden bg-accentone px-8 py-3 rounded-full font-medium group shadow-lg hover:shadow-xl transition-shadow,transform duration-300 font-primary text-cardbg",
        className
      )}
      type={type}
    >
      {children}

      <span
        className="absolute inset-0 z-0 -translate-x-full bg-gradient-to-r from-transparent via-white/30 to-transparent group-hover:translate-x-full transition-transform duration-700 ease-in-out"
        aria-hidden="true"
      />
    </motion.button>
  );
  return to ? <Link to={to}>{content}</Link> : content;
};

export default Button;
