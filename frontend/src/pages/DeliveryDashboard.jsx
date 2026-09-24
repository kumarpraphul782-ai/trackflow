import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import "./DeliveryDashboard.css";
import API_URL from "../config";
import socket from "../socket";
function DeliveryDashboard() {
  const [requests, setRequests] = useState([]);
  const [myDeliveries, setMyDeliveries] = useState([]);
  const [storeRequests, setStoreRequests] = useState([]);
  const [myStoreDeliveries, setMyStoreDeliveries] = useState([]);
  const [pickupOtp, setPickupOtp] = useState("");
 const [deliveryOtp, setDeliveryOtp] = useState("");
const [showDeliveryOtp, setShowDeliveryOtp] = useState(false);
const [selectedDeliveryId, setSelectedDeliveryId] = useState(null);

  const fetchDeliveryRequests = async () => {
    try {
     const response = await fetch(
  `${API_URL}/api/delivery-request`
);

      const data = await response.json();

      if (response.ok) {
        setRequests(data);
      }
    } catch (error) {
      console.error(error);
    }
  }; 
 const handleAccept = async (requestId) => {
  try {
    const deliveryBoy = JSON.parse(localStorage.getItem("user"));

    const response = await fetch(
      `${API_URL}/api/delivery-request/${requestId}/accept`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          deliveryBoyId: deliveryBoy._id,
        }),
      }
    );

    const data = await response.json();

    alert(data.message);

    if (response.ok) {
  fetchDeliveryRequests();
  fetchMyDeliveries();
}
  } catch (error) {
    console.error(error);
  }
};

const verifyPickupOtp = async (trackingId) => {
  try {
    const response = await fetch(
      `${API_URL}/api/shipments/${trackingId}/verify-pickup-otp`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          otp: pickupOtp,
        }),
      }
    );

    const data = await response.json();

    alert(data.message);

    if (response.ok) {
      setPickupOtp("");
      fetchMyDeliveries();
    }
  } catch (error) {
    console.error(error);
  }
};

const verifyDeliveryOtp = async (trackingId) => {
  try {
    const response = await fetch(
      `${API_URL}/api/shipments/${trackingId}/verify-delivery-otp`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          otp: deliveryOtp,
        }),
      }
    );

    const data = await response.json();

    alert(data.message);

    if (response.ok) {
      setDeliveryOtp("");
      setShowDeliveryOtp(false);
      fetchMyDeliveries();
    }
  } catch (error) {
    console.error(error);
  }
};

const updateStatus = async (trackingId, status) => {
  try {

if (status === "Picked Up") {
  const otpResponse = await fetch(
    `${API_URL}/api/shipments/${trackingId}/pickup-otp`,
    {
      method: "POST",
    }
  );

  const otpData = await otpResponse.json();

  alert(otpData.message);

  if (!otpResponse.ok) {
    return;
  }
  return;
}
 

    const response = await fetch(
      `${API_URL}/api/shipments/${trackingId}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status,
        }),
      }
    );

    const data = await response.json();

    alert(data.message);

    if (response.ok) {
      fetchMyDeliveries();
    }
  } catch (error) {
    console.error(error);
  }
};
const fetchMyDeliveries = async () => {
  try {
    const deliveryBoy = JSON.parse(localStorage.getItem("user"));

    const response = await fetch(
      `${API_URL}/api/my-deliveries/${deliveryBoy._id}`
    );

    const data = await response.json();
    if (response.ok) {
      setMyDeliveries(data);
    }
  } catch (error) {
    console.error(error);
  }
};
const fetchStoreRequests = async () => {
  try {
    const response = await fetch(
      `${API_URL}/api/marketplace-delivery-request`
    );

    const data = await response.json();

    if (response.ok) {
      setStoreRequests(data);
    }
  } catch (error) {
    console.error(error);
  }
};
const fetchMyStoreDeliveries = async () => {
  try {
    const deliveryBoy = JSON.parse(localStorage.getItem("user"));

    const response = await fetch(
      `${API_URL}/api/my-marketplace-deliveries/${deliveryBoy._id}`
    );

    const data = await response.json();

    if (response.ok) {
      setMyStoreDeliveries(data);
    }
  } catch (error) {
    console.error(error);
  }
};
const acceptStoreDelivery = async (requestId) => {
  try {
    const deliveryBoy = JSON.parse(localStorage.getItem("user"));

    const response = await fetch(
      `${API_URL}/api/marketplace-delivery-request/${requestId}/accept`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          deliveryBoyId: deliveryBoy._id,
        }),
      }
    );

    const data = await response.json();

    alert(data.message);

    if (response.ok) {
      fetchStoreRequests();
      fetchMyStoreDeliveries();
    }
  } catch (error) {
    console.error(error);
  }
};
const markStoreDelivered = async (orderId) => {
  try {
    if (!window.confirm("Mark this order as delivered?")) return;
    const response = await fetch(
      `${API_URL}/api/orders/${orderId}/delivered`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    const data = await response.json();

    alert(data.message);

    if (response.ok) {
      fetchMyStoreDeliveries();
    }
  } catch (error) {
    console.error(error);
  }
};
  useEffect(() => {
  fetchDeliveryRequests();
  fetchMyDeliveries();
  fetchStoreRequests();
  fetchMyStoreDeliveries();

  socket.on("new-marketplace-delivery-request", () => {
    fetchStoreRequests();
  });

  socket.on("marketplace-order-updated", () => {
    fetchStoreRequests();
    fetchMyStoreDeliveries();
  });

  return () => {
    socket.off("new-marketplace-delivery-request");
    socket.off("marketplace-order-updated");
  };
}, []);

const busy =
  myDeliveries.some((delivery) => delivery.status !== "Delivered") ||
  myStoreDeliveries.some(
    (order) => order.status !== "delivered" && order.status !== "cancelled"
  );

 return (
  <div className="delivery-dashboard">
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        🚚 Delivery Dashboard
      </motion.h1>

      <div
        style={{
          marginTop: "30px",
          background: "#ffffff",
          padding: "20px",
          borderRadius: "12px",
        }}
      >

<motion.div
  className="delivery-availability-card"
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.5, delay: 0.1 }}
>
  <div>
    <span className="delivery-availability-label">
      Delivery Status
    </span>

    <h2>
      {busy
        ? "🔒 Delivery in Progress"
        : "🟢 Available for Delivery"}
    </h2>
  </div>

  <span className="delivery-availability-badge">
    {busy
      ? "BUSY"
      : "AVAILABLE"}
  </span>
</motion.div>

{busy && (
  <div className="delivery-busy-message">
    🔒 Complete your current delivery before accepting another one.
  </div>
)}

{myDeliveries.some(
  (delivery) => delivery.status !== "Delivered"
) && (
  <div className="current-delivery-card">
    <div className="current-delivery-header">
      <div>
        <span className="current-delivery-label">
          CURRENT DELIVERY
        </span>

        <h2>
          📦{" "}
          {
            myDeliveries.find(
              (delivery) => delivery.status !== "Delivered"
            )?.trackingId
          }
        </h2>
      </div>

      <span className="current-delivery-status">
        {
          myDeliveries.find(
            (delivery) => delivery.status !== "Delivered"
          )?.status
        }
      </span>
    </div>

    <div className="current-delivery-route">
      <span>
        📍{" "}
        {
          myDeliveries.find(
            (delivery) => delivery.status !== "Delivered"
          )?.from
        }
      </span>

      <strong>→</strong>

      <span>
        📍{" "}
        {
          myDeliveries.find(
            (delivery) => delivery.status !== "Delivered"
          )?.to
        }
      </span>
    </div>
  </div>
)}

        <h2>📦 Delivery Requests</h2>

        {requests.length === 0 ? (
          <p>No delivery requests yet.</p>
        ) : (
          requests.map((request, index) => (
           <motion.div
             key={request._id}
             className="delivery-card"
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ duration: 0.4, delay: index * 0.1 }}
             whileHover={{ scale: 1.01, boxShadow: "0 8px 25px rgba(0,0,0,0.1)" }}
           >
              <h3 className="delivery-tracking">
                📦 {request.shipment?.trackingId}
                </h3>

              <div className="delivery-route">
  <span>📍 {request.shipment?.from}</span>
  <strong>→</strong>
  <span>📍 {request.shipment?.to}</span>
</div>

<p>
  <strong>📞 Sender Phone:</strong>{" "}
  {request.shipment?.user?.phone || "Not available"}
</p>

<div className="delivery-info">
  <p>
    <strong>Receiver:</strong> {request.shipment?.receiverName}
  </p>

  <p>
    <strong>📞 Phone:</strong> {request.shipment?.receiverPhone}
  </p>
</div>

             <p>
  <strong>Status:</strong>{" "}
  <span className="delivery-status-badge">
    {request.status}
  </span>
</p>

             <button
  className="delivery-accept-btn"
  onClick={() => handleAccept(request._id)}
>
  ✓   Accept Delivery
</button>
           </motion.div>
          ))
        )}
      </div>

     <div className="delivery-section">
        <h2>🛒 Store Order Delivery Requests</h2>

        {storeRequests.length === 0 ? (
          <p>No store delivery requests yet.</p>
        ) : (
          storeRequests.map((request, index) => (
            <motion.div
              key={request._id}
              className="delivery-card"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              whileHover={{ scale: 1.01, boxShadow: "0 8px 25px rgba(0,0,0,0.1)" }}
            >
              <h3 className="delivery-tracking">
                🛒 {request.order?.orderId}
              </h3>

              <div className="store-delivery-store">
                📍 {request.order?.store?.name} → Deliver to{" "}
                {request.order?.customer?.name}
              </div>

              <div className="delivery-info">
                <p>
                  <strong>Customer Phone:</strong>{" "}
                  {request.order?.customer?.phone || "Not available"}
                </p>
                <p>
                  <strong>Address:</strong> {request.order?.deliveryAddress}
                </p>
                <p>
                  <strong>Order Value:</strong> ₹{request.order?.total}
                </p>
                <p>
                  <strong>Items:</strong>{" "}
                  {request.order?.items
                    ?.map((i) => `${i.name} × ${i.quantity}`)
                    .join(", ")}
                </p>
                <p>
                  <strong>Payment:</strong>{" "}
                  {request.order?.paymentMethod === "cash"
                    ? "Cash on Delivery"
                    : "Paid Online"}
                </p>
              </div>

              <button
                className="delivery-accept-btn"
                onClick={() => acceptStoreDelivery(request._id)}
              >
                ✓ Accept Delivery
              </button>
            </motion.div>
          ))
        )}
      </div>

     <div className="delivery-section">
        <h2>🚚 My Deliveries</h2>

{myDeliveries.length === 0 ? (
  <p>No deliveries assigned.</p>
) : (
  myDeliveries.map((delivery, index) => (
   <motion.div
     key={delivery._id}
     className="delivery-card"
     initial={{ opacity: 0, x: -20 }}
     animate={{ opacity: 1, x: 0 }}
     transition={{ duration: 0.4, delay: index * 0.1 }}
     whileHover={{ scale: 1.01 }}
   >
     <h3 className="delivery-tracking">
  📦 {delivery.trackingId}
</h3>

      <div className="delivery-route">
  <span>📍 {delivery.from}</span>
  <strong>→</strong>
  <span>📍 {delivery.to}</span>
</div>
     <div className="delivery-info">
  <p>
    <strong>Receiver:</strong> {delivery.receiverName}
  </p>

  <p>
    <strong>📞 Phone:</strong> {delivery.receiverPhone}
  </p>

  <p>
  <strong>Status:</strong>{" "}
  <span className="delivery-status-badge">
    {delivery.status}
  </span>
</p>

  <p className="delivery-estimated">
  <strong>📅 Estimated Delivery:</strong>{" "}
  {new Date(delivery.estimatedDelivery).toLocaleDateString()}
</p>

<p className="delivery-estimated">
  <strong>📞 Sender Phone:</strong>{" "}
  {delivery.user?.phone || "Not available"}
</p>

</div>

      <div className="delivery-controls">

{delivery.status !== "Picked Up" && (
  <input
    type="text"
    placeholder="Enter Pickup OTP"
    value={pickupOtp}
    onChange={(e) => setPickupOtp(e.target.value)}
  />
)}

<button
  onClick={() => verifyPickupOtp(delivery.trackingId)}
>
  Verify Pickup OTP
</button>

  <select
  className="delivery-status-select"
  value={delivery.status}
        onChange={(e) =>
          updateStatus(delivery.trackingId, e.target.value)
        }
        style={{
          marginTop: "10px",
          padding: "8px",
          borderRadius: "8px",
        }}
      >
        <option value="Pending">Pending</option>
        <option value="Picked Up">Picked Up</option>
        <option value="Origin Hub">Origin Hub</option>
        <option value="In Transit">In Transit</option>
        <option value="Destination Hub">Destination Hub</option>
        <option value="Out for Delivery">Out for Delivery</option>
        
      </select>

    <button
  className="delivery-complete-btn"
  onClick={async () => {
    setSelectedDeliveryId(delivery.trackingId);
  try {
    const response = await fetch(
      `${API_URL}/api/shipments/${delivery.trackingId}/delivery-otp`,
      {
        method: "POST",
      }
    );

    const data = await response.json();

    alert(data.message);

    if (response.ok) {
      setShowDeliveryOtp(true);
    }
  } catch (error) {
    console.error(error);
  }
}}
  disabled={delivery.status === "Delivered"}
>
  {delivery.status === "Delivered"
    ? "✅ Delivered"
    : "Mark as Delivered"}
</button>

<AnimatePresence>
{showDeliveryOtp && selectedDeliveryId === delivery.trackingId && (
  <motion.div
    className="delivery-otp-popup"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
  >
    <motion.div
      className="delivery-otp-box"
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.8, opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <h3>🔐 Verify Receiver OTP</h3>

     <p>
  OTP sent to receiver's phone{" "}
  <strong>{delivery.receiverPhone}</strong>
</p>

      <input
  type="text"
  inputMode="numeric"
  maxLength="6"
  placeholder="Enter 6-digit OTP"
  value={deliveryOtp}
  onChange={(e) =>
    setDeliveryOtp(e.target.value.replace(/\D/g, ""))
  }
/>

      <button
  onClick={() => verifyDeliveryOtp(delivery.trackingId)}
  disabled={deliveryOtp.length !== 6}
>
  {deliveryOtp.length === 6 ? "Verify OTP" : "Enter OTP"}
</button>

     <button
  type="button"
  onClick={() => {
    setShowDeliveryOtp(false);
    setDeliveryOtp("");
  }}
>
  Cancel
</button>
    </motion.div>
  </motion.div>
)}
</AnimatePresence>

    </div>
    </motion.div>

  ))
)}
      </div>

     <div className="delivery-section">
        <h2>🛒 My Store Deliveries</h2>

        {myStoreDeliveries.length === 0 ? (
          <p>No store deliveries assigned.</p>
        ) : (
          myStoreDeliveries.map((delivery, index) => (
            <motion.div
              key={delivery._id}
              className="delivery-card"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              whileHover={{ scale: 1.01 }}
            >
              <div className="store-delivery-head">
                <h3 className="delivery-tracking">
                  🛒 {delivery.orderId}
                </h3>
                <span className="delivery-status-badge">
                  {delivery.status === "out_for_delivery"
                    ? "Out for Delivery"
                    : delivery.status}
                </span>
              </div>

              <div className="delivery-info">
                <p>
                  <strong>From Store:</strong> {delivery.store?.name} (
                  {delivery.store?.address})
                </p>
                <p>
                  <strong>Customer:</strong> {delivery.customer?.name}
                </p>
                <p>
                  <strong>📞 Phone:</strong> {delivery.customer?.phone}
                </p>
                <p>
                  <strong>Address:</strong> {delivery.deliveryAddress}
                </p>
                <p>
                  <strong>Items:</strong>{" "}
                  {delivery.items?.map((i) => `${i.name} × ${i.quantity}`).join(", ")}
                </p>
                <p>
                  <strong>Total:</strong> ₹{delivery.total} ·{" "}
                  {delivery.paymentMethod === "cash" ? "Cash on Delivery" : "Paid Online"}
                </p>
                {delivery.note && (
                  <p>
                    <strong>Note:</strong> {delivery.note}
                  </p>
                )}
              </div>

              {delivery.status === "out_for_delivery" && (
                <button
                  className="delivery-complete-btn"
                  onClick={() => markStoreDelivered(delivery._id)}
                >
                  ✅ Mark as Delivered
                </button>
              )}
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}

export default DeliveryDashboard;