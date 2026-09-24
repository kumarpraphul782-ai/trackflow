const mongoose = require("mongoose");

const shipmentRequestSchema = new mongoose.Schema(
  {
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    

    receiverName: {
      type: String,
      required: true,
    },

    receiverPhone: {
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

    parcelType: {
      type: String,
      required: true,
    },

    weight: {
      type: String,
      required: true,
    },

    description: {
      type: String,
    },

    status: {
      type: String,
      default: "Pending",
    },
acceptedBy: {
  type: mongoose.Schema.Types.ObjectId,
  ref: "User",
  default: null,
},

  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "ShipmentRequest",
  shipmentRequestSchema
);