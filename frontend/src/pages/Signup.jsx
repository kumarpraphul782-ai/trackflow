import { useState } from "react";
import logo from "../assets/trackflow-logo.png";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { motion, AnimatePresence } from "framer-motion";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import "./Login.css";
import API_URL from "../config";

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.2 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, x: -20 },
  show: { opacity: 1, x: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

function Signup() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    role: "customer",
  });
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [step, setStep] = useState(1);
  const [otp, setOtp] = useState("");
  const [otpTimer, setOtpTimer] = useState(60);

  const startTimer = () => {
    setOtpTimer(60);
    const interval = setInterval(() => {
      setOtpTimer((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleSignup = async () => {
    if (!form.name || !form.email || !form.phone || !form.password) {
      toast.error("Please fill all fields");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        setLoading(false);
        toast.error(data.message);
        return;
      }

      toast.success(data.message);
      setStep(2);
      startTimer();
      setLoading(false);
    } catch (err) {
      setLoading(false);
      toast.error("Signup Failed");
    }
  };

  const handleVerifyOtp = async () => {
    if (otp.length !== 6) {
      toast.error("Please enter a 6-digit OTP");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/auth/verify-email-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.email, otp }),
      });

      const data = await res.json();

      if (!res.ok) {
        setLoading(false);
        toast.error(data.message);
        return;
      }

      toast.success("Email verified! You can now login.");
      navigate("/login");
      setLoading(false);
    } catch (err) {
      setLoading(false);
      toast.error("Verification Failed");
    }
  };

  const handleResendOtp = async () => {
    if (otpTimer > 0) return;
    try {
      const res = await fetch(`${API_URL}/api/auth/resend-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.email }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.message);
        return;
      }

      toast.success("OTP resent to your email");
      startTimer();
    } catch (err) {
      toast.error("Failed to resend OTP");
    }
  };

  return (
    <div className="login-container">
      {[...Array(5)].map((_, i) => (
        <motion.div
          key={i}
          className="login-orb"
          animate={{
            x: [0, 25 * (i % 2 === 0 ? 1 : -1), 0],
            y: [0, -18, 0],
          }}
          transition={{
            duration: 5 + i,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          style={{
            width: `${80 + i * 35}px`,
            height: `${80 + i * 35}px`,
            left: `${12 + i * 16}%`,
            top: `${10 + (i % 3) * 28}%`,
          }}
        />
      ))}

      <AnimatePresence mode="wait">
        {step === 1 ? (
          <motion.div
            key="signup-form"
            className="login-card"
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, x: -100, scale: 0.95 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            whileHover={{ boxShadow: "0 0 60px rgba(76,201,255,0.2), 0 25px 70px rgba(0,0,0,0.4)" }}
          >
            <motion.img
              src={logo}
              alt="TrackFlow"
              style={{ height: "200px", objectFit: "contain", marginBottom: "40px", display: "block", margin: "0 auto 40px" }}
              initial={{ opacity: 0, rotate: -5 }}
              animate={{ opacity: 1, rotate: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            />

            <motion.div variants={containerVariants} initial="hidden" animate="show">
              <motion.h2 className="login-title" variants={itemVariants}>
                Create Account
              </motion.h2>

              <motion.p className="login-subtitle" variants={itemVariants}>
                Join TrackFlow to manage your shipments.
              </motion.p>

              <motion.div variants={itemVariants}>
                <input
                  type="text"
                  placeholder="Name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </motion.div>

              <motion.div variants={itemVariants}>
                <input
                  type="email"
                  placeholder="Email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
              </motion.div>

              <motion.div variants={itemVariants}>
                <input
                  type="text"
                  placeholder="Phone"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                />
              </motion.div>

              <motion.div className="password-box" variants={itemVariants}>
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
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
                <select
                  value={form.role}
                  onChange={(e) => setForm({ ...form, role: e.target.value })}
                >
                  <option value="customer">Customer</option>
                  <option value="delivery">Delivery Partner</option>
                  <option value="store">Shop / Store Owner</option>
                </select>
              </motion.div>

              <motion.div variants={itemVariants}>
                <motion.button
                  onClick={handleSignup}
                  disabled={loading}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {loading ? "Sending OTP..." : "Signup"}
                </motion.button>
              </motion.div>

              <motion.p className="signup-text" variants={itemVariants}>
                Already have an account?{" "}
                <motion.span
                  className="signup-link"
                  onClick={() => navigate("/login")}
                  whileHover={{ scale: 1.05 }}
                >
                  Login
                </motion.span>
              </motion.p>
            </motion.div>
          </motion.div>
        ) : (
          <motion.div
            key="otp-verify"
            className="login-card"
            initial={{ opacity: 0, x: 100, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            whileHover={{ boxShadow: "0 0 60px rgba(76,201,255,0.2), 0 25px 70px rgba(0,0,0,0.4)" }}
          >
            <motion.div variants={containerVariants} initial="hidden" animate="show">
              <motion.div variants={itemVariants} style={{ textAlign: "center", marginBottom: "20px" }}>
                <div style={{
                  width: "80px",
                  height: "80px",
                  borderRadius: "50%",
                  background: "linear-gradient(135deg, #22c55e, #4ade80)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 20px",
                  fontSize: "36px",
                }}>
                  📧
                </div>
              </motion.div>

              <motion.h2 className="login-title" variants={itemVariants}>
                Verify Your Email
              </motion.h2>

              <motion.p className="login-subtitle" variants={itemVariants}>
                We sent a 6-digit code to <strong style={{ color: "#4cc9ff" }}>{form.email}</strong>
              </motion.p>

              <motion.div variants={itemVariants} style={{ marginBottom: "18px" }}>
                <input
                  type="text"
                  placeholder="Enter 6-digit OTP"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  maxLength={6}
                  style={{
                    textAlign: "center",
                    fontSize: "24px",
                    letterSpacing: "10px",
                    fontWeight: "700",
                  }}
                />
              </motion.div>

              <motion.div variants={itemVariants}>
                <motion.button
                  onClick={handleVerifyOtp}
                  disabled={loading || otp.length !== 6}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  style={{
                    opacity: otp.length !== 6 ? 0.6 : 1,
                  }}
                >
                  {loading ? "Verifying..." : "Verify Email"}
                </motion.button>
              </motion.div>

              <motion.div variants={itemVariants} style={{ textAlign: "center", marginTop: "20px" }}>
                {otpTimer > 0 ? (
                  <p style={{ color: "#9fb4d3", fontSize: "14px" }}>
                    Resend OTP in <strong style={{ color: "#4cc9ff" }}>{otpTimer}s</strong>
                  </p>
                ) : (
                  <motion.span
                    className="signup-link"
                    onClick={handleResendOtp}
                    whileHover={{ scale: 1.05 }}
                    style={{ cursor: "pointer", fontSize: "14px" }}
                  >
                    Resend OTP
                  </motion.span>
                )}
              </motion.div>

              <motion.div variants={itemVariants} style={{ textAlign: "center", marginTop: "15px" }}>
                <motion.span
                  className="signup-link"
                  onClick={() => setStep(1)}
                  whileHover={{ scale: 1.05 }}
                  style={{ cursor: "pointer", fontSize: "14px" }}
                >
                  ← Back to Signup
                </motion.span>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default Signup;
