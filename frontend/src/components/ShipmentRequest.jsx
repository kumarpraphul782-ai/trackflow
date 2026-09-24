import React, { useState } from "react";
import { motion } from "framer-motion";
import API_URL from "../config";

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.06, delayChildren: 0.2 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

function ShipmentRequest() {
    const [formData, setFormData] = useState({
  receiverName: "",
  receiverPhone: "",
  from: "",
  to: "",
  parcelType: "",
  weight: "",
  description: "",
});
const handleSubmit = async () => {
  try {
    const user = JSON.parse(localStorage.getItem("user"));

    const response = await fetch(
      `${API_URL}/api/shipment-request`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          customer: user._id,
        }),
      }
    );

    const data = await response.json();
    alert(data.message);

  } catch (err) {
    console.log(err);
  }
};
  return (
    <div className="profile-page">
      <motion.div
        className="shipment-request-container"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <motion.h1
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          📦 Create Shipment Request
        </motion.h1>

        <motion.p
          className="shipment-subtitle"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          Fill in the details below to send your parcel safely.
        </motion.p>

        <motion.div
          className="shipment-form"
          variants={containerVariants}
          initial="hidden"
          animate="show"
          whileHover={{ boxShadow: "0 20px 50px rgba(0,0,0,0.3)" }}
        >
          <div className="input-grid">
            <motion.input
              type="text"
              placeholder="Receiver Name"
              value={formData.receiverName}
              onChange={(e) =>
                setFormData({ ...formData, receiverName: e.target.value })
              }
              variants={itemVariants}
              whileFocus={{ borderColor: "#3b82f6", boxShadow: "0 0 15px rgba(59,130,246,0.35)" }}
            />

            <motion.input
              type="number"
              placeholder="Receiver Phone"
              value={formData.receiverPhone}
              onChange={(e) =>
                setFormData({ ...formData, receiverPhone: e.target.value })
              }
              variants={itemVariants}
              whileFocus={{ borderColor: "#3b82f6", boxShadow: "0 0 15px rgba(59,130,246,0.35)" }}
            />

            <motion.input
              type="text"
              placeholder="Pickup Address"
              value={formData.from}
              onChange={(e) =>
                setFormData({ ...formData, from: e.target.value })
              }
              variants={itemVariants}
              whileFocus={{ borderColor: "#3b82f6", boxShadow: "0 0 15px rgba(59,130,246,0.35)" }}
            />

            <motion.input
              type="text"
              placeholder="Delivery Address"
              value={formData.to}
              onChange={(e) =>
                setFormData({ ...formData, to: e.target.value })
              }
              variants={itemVariants}
              whileFocus={{ borderColor: "#3b82f6", boxShadow: "0 0 15px rgba(59,130,246,0.35)" }}
            />

            <motion.select
              value={formData.parcelType}
              onChange={(e) =>
                setFormData({ ...formData, parcelType: e.target.value })
              }
              variants={itemVariants}
            >
              <option value="">Select Parcel Type</option>
              <option>Documents</option>
              <option>Electronics</option>
              <option>Clothes</option>
              <option>Food</option>
              <option>Fragile Item</option>
              <option>Others</option>
            </motion.select>

            <motion.input
              type="text"
              placeholder="Weight (Kg)"
              value={formData.weight}
              onChange={(e) =>
                setFormData({ ...formData, weight: e.target.value })
              }
              variants={itemVariants}
              whileFocus={{ borderColor: "#3b82f6", boxShadow: "0 0 15px rgba(59,130,246,0.35)" }}
            />
          </div>

          <motion.textarea
            placeholder="Parcel Description"
            rows="5"
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
            variants={itemVariants}
            whileFocus={{ borderColor: "#3b82f6", boxShadow: "0 0 15px rgba(59,130,246,0.35)" }}
          />

          <motion.button
            onClick={handleSubmit}
            variants={itemVariants}
            whileHover={{ scale: 1.02, boxShadow: "0 10px 30px rgba(37,99,235,0.5)" }}
            whileTap={{ scale: 0.98 }}
          >
            🚀 Send Shipment Request
          </motion.button>
        </motion.div>
      </motion.div>
    </div>
  );
}

export default ShipmentRequest;
