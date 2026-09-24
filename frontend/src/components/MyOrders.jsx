import jsPDF from "jspdf";
import socket from "../socket";
import logo from "../assets/trackflow-logo.png";
import html2canvas from "html2canvas";
import { useRef } from "react";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import API_URL from "../config";

const tableRowVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: (i) => ({
    opacity: 1,
    x: 0,
    transition: { duration: 0.4, delay: i * 0.05 },
  }),
};

const ORDER_STATUS_LABEL = {
  pending: "Awaiting Store Confirmation",
  confirmed: "Store Confirmed · Finding Partner",
  out_for_delivery: "Out for Delivery",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

const ORDER_PAY_LABEL = {
  cash: "Cash on Delivery",
  online: "Paid Online",
};

function MyOrders({
  setTrackingId,
  trackShipment,
  setActiveMenu,
}) {
  const [orders, setOrders] = useState([]);
const [selectedOrder, setSelectedOrder] = useState(null);
const [search, setSearch] = useState("");
const [statusFilter, setStatusFilter] = useState("All");
const invoiceRef = useRef(null);

const [view, setView] = useState("store");
const [storeOrders, setStoreOrders] = useState([]);

 const fetchStoreOrders = async () => {
   try {
     const user = JSON.parse(localStorage.getItem("user"));

     const response = await fetch(
       `${API_URL}/api/orders/customer/${user._id}`
     );

     const data = await response.json();

     if (response.ok) {
       setStoreOrders(data);
     }
   } catch (error) {
     console.log(error);
   }
 };

 useEffect(() => {
  fetchOrders();
  fetchStoreOrders();

  socket.on("shipment-accepted", () => {
    fetchOrders();
  });

  socket.on("shipment-status-updated", () => {
    fetchOrders();
  });

  socket.on("marketplace-order-updated", () => {
    fetchStoreOrders();
  });

  socket.on("new-marketplace-delivery-request", () => {
    fetchStoreOrders();
  });

  return () => {
    socket.off("shipment-accepted");
    socket.off("shipment-status-updated");
    socket.off("marketplace-order-updated");
    socket.off("new-marketplace-delivery-request");
  };
}, []);

  const fetchOrders = async () => {
    try {
      const user = JSON.parse(localStorage.getItem("user"));

      const response = await fetch(
        `${API_URL}/api/my-shipments/${user._id}`
      );

      const data = await response.json();

      if (response.ok) {
        setOrders(data);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const downloadInvoice = async () => {
  if (!invoiceRef.current) return;

  const canvas = await html2canvas(invoiceRef.current, {
    scale: 2,
  });

  const imgData = canvas.toDataURL("image/png");

  const pdf = new jsPDF("p", "mm", "a4");

  const pageWidth = pdf.internal.pageSize.getWidth();

  const imgWidth = pageWidth - 20;
  const imgHeight = (canvas.height * imgWidth) / canvas.width;

  pdf.addImage(
    imgData,
    "PNG",
    10,
    10,
    imgWidth,
    imgHeight
  );

  pdf.save(`Invoice-${selectedOrder.trackingId}.pdf`);
};

const filteredOrders = orders.filter((order) => {
  const matchesSearch = order.trackingId
    .toLowerCase()
    .includes(search.toLowerCase());

  const matchesStatus =
    statusFilter === "All" ||
    order.status === statusFilter;

  return matchesSearch && matchesStatus;
});

  return (
    <div className="orders-page">
      <motion.h1
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        📦 My Orders
      </motion.h1>

      <div className="orders-view-tabs">
        <motion.button
          className={view === "store" ? "active" : ""}
          onClick={() => setView("store")}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
        >
          🛒 Store Orders
        </motion.button>
        <motion.button
          className={view === "shipments" ? "active" : ""}
          onClick={() => setView("shipments")}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
        >
          🚚 Parcel Shipments
        </motion.button>
      </div>

      {view === "shipments" ? (
        <>
          <motion.div
            className="orders-toolbar"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <input
              type="text"
              placeholder="🔍 Search Tracking ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option>All</option>
              <option>Picked Up</option>
              <option>Origin Hub</option>
              <option>In Transit</option>
              <option>Destination Hub</option>
              <option>Out for Delivery</option>
              <option>Delivered</option>
            </select>
          </motion.div>

          {orders.length === 0 ? (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              No shipments found.
            </motion.p>
          ) : (
            <motion.table
              className="shipment-table"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <thead>
                <tr>
                  <th>Tracking ID</th>
                  <th>From</th>
                  <th>To</th>
                  <th>Status</th>
                  <th>Created</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
                {filteredOrders.map((order, index) => (
                  <motion.tr
                    key={order._id}
                    custom={index}
                    variants={tableRowVariants}
                    initial="hidden"
                    animate="visible"
                    whileHover={{ backgroundColor: "#eff6ff" }}
                  >
                    <td>{order.trackingId}</td>
                    <td>{order.from}</td>
                    <td>{order.to}</td>

                    <td>
                      <span
                        className={`status-badge ${order.status
                          .toLowerCase()
                          .replace(/\s+/g, "-")}`}
                      >
                        {order.status}
                      </span>
                    </td>

                    <td>
                      {new Date(order.createdAt).toLocaleDateString()}
                    </td>

                    <td>
                      <motion.button
                        onClick={() => {
                          setTrackingId(order.trackingId);
                          setActiveMenu("track");
                          setTimeout(() => {
                            trackShipment(order.trackingId);
                          }, 100);
                        }}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        🔍 Track
                      </motion.button>

                      <motion.button
                        style={{ marginLeft: "8px" }}
                        onClick={() => setSelectedOrder(order)}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        📄 Invoice
                      </motion.button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </motion.table>
          )}

          <AnimatePresence>
            {selectedOrder && (
              <motion.div
                className="invoice-overlay"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <motion.div
                  className="invoice-card"
                  ref={invoiceRef}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.8, opacity: 0 }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                >
                  <div className="invoice-header">
                    <h2>📄 Shipment Invoice</h2>

                    <motion.button
                      className="close-btn"
                      onClick={() => setSelectedOrder(null)}
                      whileHover={{ scale: 1.1, rotate: 90 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      ✕
                    </motion.button>
                  </div>

                  <motion.button
                    onClick={downloadInvoice}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    style={{
                      background: "#16a34a",
                      color: "#fff",
                      border: "none",
                      padding: "12px 20px",
                      borderRadius: "10px",
                      cursor: "pointer",
                      marginBottom: "20px",
                    }}
                  >
                    📥 Download PDF
                  </motion.button>

                  <div className="invoice-line"></div>

                  <p><strong>Invoice No:</strong> INV-{selectedOrder.trackingId}</p>

                  <p><strong>Tracking ID:</strong> {selectedOrder.trackingId}</p>

                  <p><strong>Receiver:</strong> {selectedOrder.receiverName}</p>

                  <p><strong>Phone:</strong> {selectedOrder.receiverPhone}</p>

                  <p><strong>From:</strong> {selectedOrder.from}</p>

                  <p><strong>To:</strong> {selectedOrder.to}</p>

                  <p><strong>Parcel:</strong> {selectedOrder.parcelType}</p>

                  <p><strong>Weight:</strong> {selectedOrder.weight}</p>

                  <p><strong>Description:</strong> {selectedOrder.description}</p>

                  {selectedOrder.acceptedBy && (
                    <>
                      <hr style={{ margin: "20px 0" }} />
                      <h3>👨‍💼 Assigned Admin</h3>
                      <p><strong>Name:</strong> {selectedOrder.acceptedBy.name}</p>
                      <p><strong>Email:</strong> {selectedOrder.acceptedBy.email}</p>
                      <p><strong>Phone:</strong> {selectedOrder.acceptedBy.phone}</p>
                    </>
                  )}

                  {selectedOrder.deliveryBoy && (
                    <>
                      <hr style={{ margin: "20px 0" }} />
                      <h3>🚚 Delivery Partner</h3>
                      <p><strong>Name:</strong> {selectedOrder.deliveryBoy.name}</p>
                      <p><strong>Email:</strong> {selectedOrder.deliveryBoy.email}</p>
                      <p><strong>Phone:</strong> {selectedOrder.deliveryBoy.phone}</p>
                    </>
                  )}

                  <p>
                    <strong>Status:</strong>{" "}
                    <span
                      className={`status-badge ${selectedOrder.status
                        .toLowerCase()
                        .replace(/\s+/g, "-")}`}
                    >
                      {selectedOrder.status}
                    </span>
                  </p>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </>
      ) : (
        <div className="store-orders-area">
          {storeOrders.length === 0 ? (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              No store orders yet. Order something from the marketplace!
            </motion.p>
          ) : (
            <motion.div
              className="store-orders-list"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              {storeOrders.map((order, index) => (
                <motion.div
                  key={order._id}
                  className="store-order-card"
                  custom={index}
                  variants={tableRowVariants}
                  initial="hidden"
                  animate="visible"
                >
                  <div className="store-order-head">
                    <div>
                      <h3>{order.store?.name || "Store"}</h3>
                      <p className="store-order-id">
                        {order.orderId} ·{" "}
                        {new Date(order.createdAt).toLocaleString()}
                      </p>
                    </div>
                    <span
                      className={`store-order-status ${order.status}`}
                    >
                      {ORDER_STATUS_LABEL[order.status]}
                    </span>
                  </div>

                  <div className="store-order-items">
                    {order.items.map((item) => (
                      <div className="store-order-item" key={item.product + item.name}>
                        <span>{item.name}</span>
                        <span>× {item.quantity}</span>
                        <span>₹{item.price * item.quantity}</span>
                      </div>
                    ))}
                  </div>

                  <div className="store-order-foot">
                    <div>
                      <strong>Total: ₹{order.total}</strong>
                      <span className={`store-order-pay ${order.paymentStatus}`}>
                        {ORDER_PAY_LABEL[order.paymentMethod] || order.paymentMethod}
                      </span>
                      {order.paymentMethod === "cash" &&
                        order.paymentStatus === "pending" && (
                          <span className="store-order-pay-tip">
                            Pay on delivery
                          </span>
                        )}
                    </div>
                    <p className="store-order-address">
                      📍 {order.deliveryAddress}
                    </p>
                  </div>

                  {order.deliveryBoy && (
                    <div className="store-order-partner">
                      <div className="partner-avatar">
                        {(order.deliveryBoy.name || "e")[0].toUpperCase()}
                      </div>
                      <div className="partner-info">
                        <p className="partner-label">
                          🚚 Your Delivery Partner
                        </p>
                        <h4>{order.deliveryBoy.name}</h4>
                        <p className="partner-contact">
                          📞 {order.deliveryBoy.phone || "Not available"}
                        </p>
                      </div>
                    </div>
                  )}
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      )}

      <div style={{ display: "none" }}>
        <img src={logo} alt="TrackFlow" />
      </div>
    </div>
  );
}

export default MyOrders;