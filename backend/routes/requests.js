const express = require("express");
const auth = require("../middleware/auth");
const Shipment = require("../models/shipment");
const ShipmentRequest = require("../models/shipmentRequest");
const DeliveryRequest = require("../models/deliveryRequest");
const Notification = require("../models/notification");
const User = require("../models/user");

// Shipment & delivery request routes: customer requests, admin accept/decline,
// delivery partner acceptance
module.exports = (io) => {
  const router = express.Router();

  // Get All Shipment Requests (Admin)
  router.get("/shipment-request", async (req, res) => {
    try {
      const requests = await ShipmentRequest.find().sort({
        createdAt: -1,
      });

      res.status(200).json(requests);
    } catch (err) {
      console.log(err);

      res.status(500).json({
        message: err.message,
      });
    }
  });

  // Get Unassigned Delivery Requests (Delivery Partner)
  router.get("/delivery-request", async (req, res) => {
    try {
      const requests = await DeliveryRequest.find({
        acceptedByDelivery: null,
      })
        .populate({
          path: "shipment",
          populate: {
            path: "user",
            select: "name phone",
          },
        })
        .sort({ createdAt: -1 });

      res.status(200).json(requests);
    } catch (err) {
      console.log(err);

      res.status(500).json({
        message: err.message,
      });
    }
  });

  // Get Deliveries Assigned to a Delivery Partner
  router.get("/my-deliveries/:deliveryBoyId", async (req, res) => {
    try {
      const shipments = await Shipment.find({
        deliveryBoy: req.params.deliveryBoyId,
      })
        .populate("user", "name phone")
        .sort({ createdAt: -1 });

      res.status(200).json(shipments);
    } catch (err) {
      console.log(err);

      res.status(500).json({
        message: err.message,
      });
    }
  });

  // Create Shipment Request (Customer)
  router.post("/shipment-request", async (req, res) => {
    try {
      const request = await ShipmentRequest.create(req.body);
      io.emit("new-request");
      res.status(201).json({
        message: "Shipment request created successfully",
        request,
      });
    } catch (err) {
      console.log(err);

      res.status(500).json({
        message: err.message,
      });
    }
  });

  // Accept Shipment Request (Admin) -> creates Shipment + DeliveryRequest
  router.put("/shipment-request/:id/accept", auth, async (req, res) => {
    try {
      const request = await ShipmentRequest.findOneAndUpdate(
        {
          _id: req.params.id,
          acceptedBy: null,
        },
        {
          acceptedBy: req.user._id,
        },
        {
          new: true,
        }
      );

      if (!request) {
        return res.status(400).json({
          message:
            "This request has already been accepted by another admin.",
        });
      }

      const trackingId =
        "TRK" + Date.now().toString().slice(-8) +
        Math.random().toString(36).slice(2, 5).toUpperCase();
      const shipment = new Shipment({
        trackingId,
        from: request.from,
        to: request.to,
        user: request.customer,
        acceptedBy: req.user._id,
        status: "Pending",

        receiverName: request.receiverName,
        receiverPhone: request.receiverPhone,
        parcelType: request.parcelType,
        weight: request.weight,
        description: request.description,

        lastUpdated: new Date(),
        history: [
          {
            status: "Pending",
            time: new Date(),
          },
        ],
        estimatedDelivery: new Date(
          Date.now() + 5 * 24 * 60 * 60 * 1000
        ),
      });

      await shipment.save();
      try {
        await DeliveryRequest.create({
          shipment: shipment._id,
          customer: request.customer,
          acceptedByAdmin: req.user._id,
        });
      } catch (err) {
        console.log("DeliveryRequest Error:", err);
      }

      const savedShipment = await Shipment.findById(shipment._id).populate(
        "acceptedBy",
        "name email phone"
      );

      await Notification.create({
        user: request.customer,
        message: `🎉 Your shipment request has been accepted. Tracking ID: ${trackingId}`,
      });
      io.emit("shipment-accepted");
      io.emit("request-updated");
      await ShipmentRequest.findByIdAndDelete(req.params.id);

      res.status(200).json({
        message: "Shipment accepted successfully",
        shipment,
      });
    } catch (err) {
      console.error("❌ ACCEPT ERROR:", err);

      res.status(500).json({
        message: err.message,
      });
    }
  });

  // Decline Shipment Request (Admin)
  router.put("/shipment-request/:id/decline", auth, async (req, res) => {
    try {
      const request = await ShipmentRequest.findById(req.params.id);

      if (!request) {
        return res.status(404).json({
          message: "Request not found",
        });
      }

      await Notification.create({
        user: request.customer,
        message: "❌ Your shipment request has been declined by the admin.",
      });
      io.emit("shipment-declined");
      await ShipmentRequest.findByIdAndDelete(req.params.id);

      res.status(200).json({
        message: "Shipment request declined successfully",
      });
    } catch (err) {
      console.log(err);

      res.status(500).json({
        message: err.message,
      });
    }
  });

  // Accept Delivery Request (Delivery Partner)
  router.put("/delivery-request/:id/accept", async (req, res) => {
    try {
      const activeDelivery = await Shipment.findOne({
        deliveryBoy: req.body.deliveryBoyId,
        status: { $ne: "Delivered" },
      });

      if (activeDelivery) {
        return res.status(400).json({
          message:
            "You already have an active delivery. Complete it first.",
        });
      }
      const request = await DeliveryRequest.findOneAndUpdate(
        {
          _id: req.params.id,
          acceptedByDelivery: null,
        },
        {
          acceptedByDelivery: req.body.deliveryBoyId,
          status: "Accepted",
        },
        {
          new: true,
        }
      );

      if (!request) {
        return res.status(400).json({
          message: "This delivery has already been accepted.",
        });
      }
      const shipment = await Shipment.findById(request.shipment);

      shipment.deliveryBoy = req.body.deliveryBoyId;

      await shipment.save();

      const deliveryBoy = await User.findById(req.body.deliveryBoyId);

      await Notification.create({
        user: request.customer,
        message: `🚚 Delivery Partner Assigned: ${deliveryBoy.name} has been assigned to your shipment.`,
      });

      res.status(200).json({
        message: "Delivery accepted successfully",
      });
    } catch (err) {
      console.log(err);

      res.status(500).json({
        message: err.message,
      });
    }
  });

  return router;
};