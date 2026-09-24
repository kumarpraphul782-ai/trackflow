const mongoose = require("mongoose");

const marketplaceOrderSchema = new mongoose.Schema(
  {
    orderId: {
      type: String,
      unique: true,
    },

    store: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Store",
      required: true,
    },

    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    items: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
        },
        name: {
          type: String,
          required: true,
        },
        price: {
          type: Number,
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
          min: 1,
        },
      },
    ],

    deliveryAddress: {
      type: String,
      required: true,
    },

    customerName: String,
    customerPhone: String,
    note: String,

    paymentMethod: {
      type: String,
      enum: ["cash", "online"],
      default: "cash",
    },

    paymentStatus: {
      type: String,
      enum: ["pending", "paid"],
      default: "pending",
    },

    subtotal: {
      type: Number,
      required: true,
    },
    deliveryFee: {
      type: Number,
      default: 30,
    },
    total: {
      type: Number,
      required: true,
    },

    status: {
      type: String,
      enum: [
        "pending",
        "confirmed",
        "out_for_delivery",
        "delivered",
        "cancelled",
      ],
      default: "pending",
    },

    deliveryBoy: {
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
  "MarketplaceOrder",
  marketplaceOrderSchema
);