const mongoose = require("mongoose");

const shipmentSchema = new mongoose.Schema(
  {
    trackingId: {
      type: String,
      unique: true,
      required: true,
    },

    status: {
      type: String,
      required: true,
    },

    from: {
      type: String,
      required: true,
    },

    to: {
      type: String,
      required: true,
    },

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    acceptedBy: {
  type: mongoose.Schema.Types.ObjectId,
  ref: "User",
},
deliveryBoy: {
  type: mongoose.Schema.Types.ObjectId,
  ref: "User",
  default: null,
},
    receiverName: {
  type: String,
},

receiverPhone: {
  type: String,
},

pickupOtp: {
  type: Number,
  default: null,
},

pickupOtpExpiry: {
  type: Date,
  default: null,
},

deliveryOtp: {
  type: Number,
  default: null,
},

deliveryOtpExpiry: {
  type: Date,
  default: null,
},

parcelType: {
  type: String,
},

weight: {
  type: String,
},

description: {
  type: String,
},

    estimatedDelivery: {
      type: Date,
    },

    lastUpdated: {
      type: Date,
      default: Date.now,
    },

    history: [
      {
        status: String,
        time: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Shipment", shipmentSchema);