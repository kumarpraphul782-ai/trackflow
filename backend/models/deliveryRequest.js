const mongoose = require("mongoose");

const deliveryRequestSchema = new mongoose.Schema(
  {
    shipment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Shipment",
      required: true,
    },

    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    acceptedByAdmin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    acceptedByDelivery: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    status: {
      type: String,
      enum: ["Pending", "Accepted"],
      default: "Pending",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "DeliveryRequest",
  deliveryRequestSchema
);