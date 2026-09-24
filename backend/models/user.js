const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
    },

    phone: {
      type: String,
      required: true,
    },

    password: {
      type: String,
      required: true,
    },

    isVerified: {
      type: Boolean,
      default: false,
    },

    emailOtp: {
      type: String,
      default: null,
    },

    emailOtpExpiry: {
      type: Date,
      default: null,
    },

    role: {
      type: String,
      enum: ["customer", "admin", "delivery", "store"],
      default: "customer",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("User", userSchema);