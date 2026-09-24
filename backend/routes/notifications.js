const express = require("express");
const Notification = require("../models/notification");

const router = express.Router();

// Get User Notifications
router.get("/notifications/:userId", async (req, res) => {
  try {
    const notifications = await Notification.find({
      user: req.params.userId,
    }).sort({ createdAt: -1 });

    res.status(200).json(notifications);
  } catch (err) {
    console.log(err);

    res.status(500).json({
      message: err.message,
    });
  }
});

// Mark All Notifications as Read
router.put("/notifications/read/:userId", async (req, res) => {
  try {
    await Notification.updateMany(
      {
        user: req.params.userId,
        isRead: false,
      },
      {
        isRead: true,
      }
    );

    res.status(200).json({
      message: "Notifications marked as read",
    });
  } catch (err) {
    console.log(err);

    res.status(500).json({
      message: err.message,
    });
  }
});

module.exports = router;