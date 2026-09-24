import { useState } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../assets/trackflow-logo.png";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import "./Login.css";
import API_URL from "../config";

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.3 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

const floatOrb = {
  animate: (i) => ({
    x: [0, 30 * (i % 2 === 0 ? 1 : -1), 0],
    y: [0, -20, 0],
    scale: [1, 1.1, 1],
    transition: {
      duration: 5 + i,
      repeat: Infinity,
      ease: "easeInOut",
    },
  }),
};

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

const handleLogin = async () => {
    setLoading(true);
  try {
    const response = await fetch(`${API_URL}/api/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        password,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
        setLoading(false);
  toast.error(data.message);
  return;
}

localStorage.setItem("token", data.token);
localStorage.setItem("role", data.role);
localStorage.setItem("user", JSON.stringify(data.user));

toast.success("Login Successful!");

setLoading(false);

if (data.role === "customer") {
  navigate("/customer");
} else if (data.role === "admin") {
  navigate("/admin");
} else if (data.role === "delivery") {
  navigate("/delivery");
} else if (data.role === "store") {
  navigate("/store-dashboard");
}

  } catch (error) {
    setLoading(false);
    toast.error("Network error. Please try again.");
  }
};

  return (
    <div className="login-container">
      {[...Array(5)].map((_, i) => (
        <motion.div
          key={i}
          className="login-orb"
          custom={i}
          variants={floatOrb}
          animate="animate"
          style={{
            width: `${80 + i * 40}px`,
            height: `${80 + i * 40}px`,
            left: `${10 + i * 18}%`,
            top: `${15 + (i % 3) * 25}%`,
          }}
        />
      ))}

      <motion.div
        className="login-card"
        initial={{ opacity: 0, y: -40, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
        whileHover={{ boxShadow: "0 0 60px rgba(76,201,255,0.2), 0 25px 70px rgba(0,0,0,0.4)" }}
      >
        <motion.img
          src={logo}
          alt="TrackFlow"
          style={{ height: "200px", objectFit: "contain", marginBottom: "40px", display: "block", margin: "0 auto 40px" }}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        />

        <motion.div variants={containerVariants} initial="hidden" animate="show">
          <motion.h2 className="login-title" variants={itemVariants}>
            Welcome Back
          </motion.h2>

          <motion.p className="login-subtitle" variants={itemVariants}>
            Sign in to manage your shipments.
          </motion.p>

          <motion.div variants={itemVariants}>
            <input
              type="email"
              placeholder="Enter Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </motion.div>

          <motion.div className="password-box" variants={itemVariants}>
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Enter Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <motion.span
              className="eye-icon"
              onClick={() => setShowPassword(!showPassword)}
              whileHover={{ scale: 1.2 }}
              whileTap={{ scale: 0.9 }}
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </motion.span>
          </motion.div>

          <motion.div variants={itemVariants}>
            <motion.button
              onClick={handleLogin}
              disabled={loading}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {loading ? "Signing In..." : "Login"}
            </motion.button>
          </motion.div>

          <motion.p className="signup-text" variants={itemVariants}>
            Don't have an account?{" "}
            <motion.span
              className="signup-link"
              onClick={() => navigate("/signup")}
              whileHover={{ scale: 1.05 }}
            >
              Sign Up
            </motion.span>
          </motion.p>
        </motion.div>
      </motion.div>
    </div>
  );
}

export default Login;
