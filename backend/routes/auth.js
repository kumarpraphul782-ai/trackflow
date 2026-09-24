const express = require("express");

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/user");
const { sendOTPEmail } = require("../utils/email");

const router = express.Router();

// Register - Step 1: Create user and send OTP
router.post("/signup", async (req, res) => {
  try {
     const { name, email, phone, password, role } = req.body;

     const allowedRoles = ["customer", "delivery", "store"];
     const selectedRole = allowedRoles.includes(role) ? role : "customer";

     const existingUser = await User.findOne({ email });

     if (existingUser) {
      if (!existingUser.isVerified) {
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        existingUser.emailOtp = otp;
        existingUser.emailOtpExpiry = new Date(Date.now() + 10 * 60 * 1000);
        existingUser.name = name;
        existingUser.phone = phone;
        existingUser.role = selectedRole;
        existingUser.password = await bcrypt.hash(password, 10);
        await existingUser.save();

        try {
          await sendOTPEmail(email, otp, "signup");
        } catch (emailErr) {
          console.log("Email send failed:", emailErr.message);
        }

        return res.status(200).json({
          message: "OTP sent to your email. Please verify.",
          email,
        });
      }
      return res.status(400).json({
        message: "Email already exists",
      });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      phone,
      password: hashedPassword,
      role: selectedRole,
      isVerified: false,
      emailOtp: otp,
      emailOtpExpiry: new Date(Date.now() + 10 * 60 * 1000),
    });

    try {
      await sendOTPEmail(email, otp, "signup");
    } catch (emailErr) {
      console.log("Email send failed:", emailErr.message);
    }

    res.status(200).json({
      message: "OTP sent to your email. Please verify.",
      email,
    });

  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
});

// Register - Step 2: Verify OTP
router.post("/verify-email-otp", async (req, res) => {
  try {
    const { email, otp } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({
        message: "User not found",
      });
    }

    if (user.isVerified) {
      return res.status(400).json({
        message: "Email already verified",
      });
    }

    if (!user.emailOtp || !user.emailOtpExpiry) {
      return res.status(400).json({
        message: "No OTP found. Please signup again.",
      });
    }

    if (new Date() > user.emailOtpExpiry) {
      return res.status(400).json({
        message: "OTP has expired. Please signup again.",
      });
    }

    if (user.emailOtp !== otp) {
      return res.status(400).json({
        message: "Invalid OTP",
      });
    }

    user.isVerified = true;
    user.emailOtp = null;
    user.emailOtpExpiry = null;
    await user.save();

    res.status(200).json({
      message: "Email verified successfully",
    });

  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
});

// Resend OTP
router.post("/resend-otp", async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({
        message: "User not found",
      });
    }

    if (user.isVerified) {
      return res.status(400).json({
        message: "Email already verified",
      });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.emailOtp = otp;
    user.emailOtpExpiry = new Date(Date.now() + 10 * 60 * 1000);
    await user.save();

    try {
      await sendOTPEmail(email, otp, "signup");
    } catch (emailErr) {
      console.log("Email send failed:", emailErr.message);
    }

    res.status(200).json({
      message: "OTP resent to your email",
    });

  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
});

// Login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({
        message: "Invalid credentials",
      });
    }

    if (!user.isVerified) {
      return res.status(400).json({
        message: "Please verify your email first",
      });
    }

    const match = await bcrypt.compare(password, user.password);

    if (!match) {
      return res.status(400).json({
        message: "Invalid credentials",
      });
    }

    const token = jwt.sign(
      {
        id: user._id,
        role: user.role,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      }
    );

    res.json({
      token,
      role: user.role,
      user: { _id: user._id, name: user.name, email: user.email, phone: user.phone, role: user.role },
    });

  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
});

// Get Logged In User
router.get("/me", async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        message: "No token",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id).select("-password");

    res.json(user);

  } catch (err) {
    res.status(401).json({
      message: "Invalid Token",
    });
  }
});

module.exports = router;
