const express = require("express");
const auth = require("../middleware/auth");
const Shipment = require("../models/shipment");
const Notification = require("../models/notification");
const { sendOTPEmail } = require("../utils/email");

// Shipment routes: creation, tracking, status updates, OTP verification
module.exports = (io) => {
  const router = express.Router();

  // Get All Shipments for an Admin
  router.get("/shipments", async (req, res) => {
    try {
      const adminId = req.query.adminId;

      console.log("📌 Admin ID:", adminId);

      const shipments = await Shipment.find({
        acceptedBy: adminId,
      }).sort({
        lastUpdated: -1,
      });

      res.status(200).json(shipments);
    } catch (err) {
      console.log(err);

      res.status(500).json({
        message: "Unable to fetch shipments",
      });
    }
  });

  // Get Logged In Customer Shipments
  router.get("/my-shipments/:userId", async (req, res) => {
    try {
      const shipments = await Shipment.find({
        user: req.params.userId,
      })
        .populate("acceptedBy", "name email phone")
        .populate("deliveryBoy", "name email phone")
        .sort({
          createdAt: -1,
        });

      res.status(200).json(shipments);
    } catch (err) {
      console.log(err);

      res.status(500).json({
        message: err.message,
      });
    }
  });

  // Track Shipment by Tracking ID
  router.get("/shipments/:trackingId", async (req, res) => {
    try {
      const trackingId = req.params.trackingId.trim().toUpperCase();

      const shipment = await Shipment.findOne({ trackingId })
        .populate("acceptedBy", "name email phone")
        .populate("deliveryBoy", "name email phone");

      if (!shipment) {
        return res.status(404).json({
          message: "Shipment not found",
        });
      }

      res.status(200).json(shipment);
    } catch (err) {
      console.log(err);

      res.status(500).json({
        message: "Unable to track shipment",
      });
    }
  });

  // Create New Shipment (Admin)
  router.post("/shipments", auth, async (req, res) => {
    try {
      const {
        from,
        to,
        status,
        receiverName,
        receiverPhone,
        parcelType,
        weight,
        description,
      } = req.body;

      const trackingId =
        "TRK" + Date.now().toString().slice(-8) +
        Math.random().toString(36).slice(2, 5).toUpperCase();

      const shipment = new Shipment({
        trackingId,
        from,
        to,
        user: req.body.user,

        acceptedBy: req.user._id,

        status: status || "Pending",

        receiverName,
        receiverPhone,
        parcelType,
        weight,
        description,

        lastUpdated: new Date(),
        history: [
          {
            status: status || "Pending",
            time: new Date(),
          },
        ],
        estimatedDelivery: new Date(
          Date.now() + 5 * 24 * 60 * 60 * 1000
        ),
      });

      await shipment.save();

      res.status(201).json({
        message: "Shipment created successfully",
        shipment,
      });
    } catch (err) {
      console.log("CREATE ERROR", err);

      res.status(500).json({
        message: err.message,
      });
    }
  });

  // Generate Pickup OTP
  router.post("/shipments/:trackingId/pickup-otp", async (req, res) => {
    try {
      const trackingId = req.params.trackingId.trim().toUpperCase();

      const shipment = await Shipment.findOne({ trackingId }).populate(
        "user",
        "name email"
      );

      if (!shipment) {
        return res.status(404).json({
          message: "Shipment not found",
        });
      }

      const pickupOtp = Math.floor(100000 + Math.random() * 900000);

      shipment.pickupOtp = pickupOtp;
      shipment.pickupOtpExpiry = new Date(Date.now() + 10 * 60 * 1000);

      await shipment.save();

      if (shipment.user && shipment.user.email) {
        try {
          await sendOTPEmail(shipment.user.email, pickupOtp, "pickup");
          console.log(`Pickup OTP email sent to ${shipment.user.email}`);
        } catch (emailErr) {
          console.log("Email send failed:", emailErr.message);
        }
      }

      res.status(200).json({
        message: "Pickup OTP generated and sent to customer email",
      });
    } catch (err) {
      console.log(err);

      res.status(500).json({
        message: "Unable to generate pickup OTP",
      });
    }
  });

  // Generate Delivery OTP
  router.post("/shipments/:trackingId/delivery-otp", async (req, res) => {
    try {
      const trackingId = req.params.trackingId.trim().toUpperCase();

      const shipment = await Shipment.findOne({ trackingId }).populate(
        "user",
        "name email"
      );

      if (!shipment) {
        return res.status(404).json({
          message: "Shipment not found",
        });
      }

      const deliveryOtp = Math.floor(100000 + Math.random() * 900000);

      shipment.deliveryOtp = deliveryOtp;
      shipment.deliveryOtpExpiry = new Date(Date.now() + 10 * 60 * 1000);

      await shipment.save();

      if (shipment.user && shipment.user.email) {
        try {
          await sendOTPEmail(shipment.user.email, deliveryOtp, "delivery");
          console.log(`Delivery OTP email sent to ${shipment.user.email}`);
        } catch (emailErr) {
          console.log("Email send failed:", emailErr.message);
        }
      }

      res.status(200).json({
        message: "Delivery OTP generated and sent to customer email",
      });
    } catch (err) {
      console.log(err);

      res.status(500).json({
        message: "Unable to generate delivery OTP",
      });
    }
  });

  // Verify Delivery OTP
  router.post(
    "/shipments/:trackingId/verify-delivery-otp",
    async (req, res) => {
      try {
        const trackingId = req.params.trackingId.trim().toUpperCase();
        const { otp } = req.body;

        const shipment = await Shipment.findOne({ trackingId });

        if (!shipment) {
          return res.status(404).json({
            message: "Shipment not found",
          });
        }

        if (Number(otp) !== shipment.deliveryOtp) {
          return res.status(400).json({
            message: "Invalid Receiver OTP",
          });
        }

        if (
          shipment.deliveryOtpExpiry &&
          new Date() > shipment.deliveryOtpExpiry
        ) {
          return res.status(400).json({
            message: "OTP has expired. Please request a new one.",
          });
        }

        shipment.status = "Delivered";
        shipment.deliveryOtp = null;
        shipment.lastUpdated = new Date();

        shipment.history.push({
          status: "Delivered",
          time: new Date(),
        });

        await shipment.save();

        res.status(200).json({
          message: "Delivery verified successfully",
        });
      } catch (err) {
        console.log(err);

        res.status(500).json({
          message: "Unable to verify delivery OTP",
        });
      }
    }
  );

  // Verify Pickup OTP
  router.post(
    "/shipments/:trackingId/verify-pickup-otp",
    async (req, res) => {
      try {
        const trackingId = req.params.trackingId.trim().toUpperCase();
        const { otp } = req.body;

        const shipment = await Shipment.findOne({ trackingId });

        if (!shipment) {
          return res.status(404).json({
            message: "Shipment not found",
          });
        }

        if (Number(otp) !== shipment.pickupOtp) {
          return res.status(400).json({
            message: "Invalid Pickup OTP",
          });
        }

        if (
          shipment.pickupOtpExpiry &&
          new Date() > shipment.pickupOtpExpiry
        ) {
          return res.status(400).json({
            message: "OTP has expired. Please request a new one.",
          });
        }

        shipment.status = "Picked Up";
        shipment.pickupOtp = null;
        shipment.lastUpdated = new Date();

        shipment.history.push({
          status: "Picked Up",
          time: new Date(),
        });

        await shipment.save();

        res.status(200).json({
          message: "Pickup verified successfully",
        });
      } catch (err) {
        console.log(err);

        res.status(500).json({
          message: "Unable to verify pickup OTP",
        });
      }
    }
  );

  // Update Shipment Status (Admin)
  router.put("/shipments/:trackingId", auth, async (req, res) => {
    try {
      const trackingId = req.params.trackingId.trim().toUpperCase();
      const { status } = req.body;

      const shipment = await Shipment.findOne({ trackingId });

      if (!shipment) {
        return res.status(404).json({
          message: "Shipment not found",
        });
      }

      shipment.status = status;
      shipment.lastUpdated = new Date();

      shipment.history.push({
        status,
        time: new Date(),
      });

      await shipment.save();

      if (status === "Delivered") {
        await Notification.create({
          user: shipment.user,
          message: `🎉 Your shipment ${shipment.trackingId} has been delivered successfully.`,
        });
      } else {
        await Notification.create({
          user: shipment.user,
          message: `🚚 Shipment ${shipment.trackingId} status updated to ${status}.`,
        });
      }

      io.emit("shipment-status-updated");

      res.status(200).json({
        message: "Shipment updated successfully",
        shipment,
      });
    } catch (err) {
      console.log(err);

      res.status(500).json({
        message: "Unable to update shipment",
      });
    }
  });

  // Delete Shipment (Admin)
  router.delete("/shipments/:trackingId", auth, async (req, res) => {
    try {
      const trackingId = req.params.trackingId.trim().toUpperCase();

      const shipment = await Shipment.findOneAndDelete({ trackingId });

      if (!shipment) {
        return res.status(404).json({
          message: "Shipment not found",
        });
      }

      res.status(200).json({
        message: "Shipment deleted successfully",
      });
    } catch (err) {
      console.log(err);

      res.status(500).json({
        message: "Unable to delete shipment",
      });
    }
  });

  return router;
};