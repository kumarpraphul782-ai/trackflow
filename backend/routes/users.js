const express = require("express");
const User = require("../models/user");

const router = express.Router();

// Get All Delivery Partners
router.get("/delivery-boys", async (req, res) => {
  try {
    const deliveryBoys = await User.find(
      { role: "delivery" },
      "name email phone"
    );

    res.status(200).json(deliveryBoys);
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
});

module.exports = router;