const mongoose = require("mongoose");
require("dotenv").config();

const Shipment = require("./models/shipment");

async function seedDatabase() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB Connected!");

    const shipment = new Shipment({
      trackingId: "TRK123456789",
      status: "In Transit",
      from: "Patna, Bihar",
      to: "Bhubaneswar, Odisha"
    });

    await shipment.save();

    console.log("Shipment added successfully!");
    await mongoose.connection.close();

  } catch (err) {
    console.log("Error:", err);
  }
}

 seedDatabase();