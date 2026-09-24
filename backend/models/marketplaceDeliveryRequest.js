const mongoose = require("mongoose");

const marketplaceDeliveryRequestSchema = new mongoose.Schema(
  {
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "MarketplaceOrder",
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
  "MarketplaceDeliveryRequest",
  marketplaceDeliveryRequestSchema
);