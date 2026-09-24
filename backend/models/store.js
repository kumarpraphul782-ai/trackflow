const mongoose = require("mongoose");

const storeSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    category: {
      type: String,
      enum: ["restaurant", "cafe", "grocery", "other"],
      default: "other",
      required: true,
    },

    description: {
      type: String,
      default: "",
    },

    address: {
      type: String,
      default: "",
    },

    phone: {
      type: String,
      default: "",
    },

    deliveryTime: {
      type: String,
      default: "20-30 min",
    },

    image: {
      type: String,
      default: "",
    },

    isOpen: {
      type: Boolean,
      default: true,
    },

    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },

    rating: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

storeSchema.index({ owner: 1 });

module.exports = mongoose.model("Store", storeSchema);