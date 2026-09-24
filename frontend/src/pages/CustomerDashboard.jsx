import { useNavigate } from "react-router-dom";
import logo from "../assets/trackflow-logo.png";
import Addresses from "../components/Addresses";
import Settings from "../components/Settings";
import socket from "../socket";
import Notifications from "../components/Notifications";
import TrackShipment from "../components/TrackShipment";
import Profile from "../components/Profile";
import MyOrders from "../components/MyOrders";
import ShipmentRequest from "../components/ShipmentRequest";
import Sidebar from "../components/Sidebar";
import { useState, useEffect, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { motion, AnimatePresence } from "framer-motion";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import API_URL from "../config";
import {
  FiUser,
  FiPackage,
  FiMapPin,
  FiBell,
  FiSettings,
  FiLogOut,
  FiTruck,
} from "react-icons/fi";

import "../App.css";

const truckIcon = new L.Icon({
  iconUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

function CustomerDashboard() {
    
  const [trackingId, setTrackingId] = useState("");
  const [activeMenu, setActiveMenu] = useState("track");
  const trackingIdRef = useRef(trackingId);

  useEffect(() => {
    trackingIdRef.current = trackingId;
  }, [trackingId]);

  const [notificationCount, setNotificationCount] = useState(0);
  const [shipment, setShipment] = useState(null);
  const [error, setError] = useState("");
  const [authed, setAuthed] = useState(false);
  const navigate = useNavigate();
  useEffect(() => {
  const token = localStorage.getItem("token");

  if (!token) {
    navigate("/login");
    return;
  }

  setAuthed(true);
  fetchNotificationCount();
  socket.on("shipment-accepted", () => {
  fetchNotificationCount();
});

socket.on("shipment-declined", () => {
  fetchNotificationCount();
});

socket.on("shipment-status-updated", () => {
  fetchNotificationCount();
  if (trackingIdRef.current) {
  trackShipment(trackingIdRef.current);
}
});
return () => {
  socket.off("shipment-accepted");
  socket.off("shipment-declined");
  socket.off("shipment-status-updated");
};
}, [navigate]);
  

 const trackShipment = async (id = trackingId) => {
  if (!id.trim()) {
    setShipment(null);
    setError("Please enter a Tracking ID");
    return;
  }

  try {
    setError("");

    const response = await fetch(
      `${API_URL}/api/shipments/${id.trim()}`
    );

    if (!response.ok) {
      throw new Error("Tracking request failed");
    }

    const data = await response.json();

    setShipment(data);

    // Input box bhi update ho jayega
    setTrackingId(id);

  } catch (err) {
    setShipment(null);
    setError("Unable to fetch tracking details");
  }
};
  const fetchNotificationCount = async () => {
  try {
    const user = JSON.parse(localStorage.getItem("user"));

    const response = await fetch(
      `${API_URL}/api/notifications/${user._id}`
    );

    const data = await response.json();

    if (response.ok) {
      setNotificationCount(
  data.filter((item) => !item.isRead).length
);
    }
  } catch (error) {
    console.error(error);
  }
};

useEffect(() => {
  if (activeMenu === "notifications") {
    fetchNotificationCount();
  }
}, [activeMenu]);

const handleLogout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("role");
  navigate("/login");
};
  const steps = [
    "Picked Up",
    "Origin Hub",
    "In Transit",
    "Destination Hub",
    "Out for Delivery",
    "Delivered",
  ];

  if (!authed) return null;

  return (
    <div className="app">
      <motion.header
  className="navbar"
  initial={{ opacity: 0, y: -20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.5 }}
>
        <img
  src={logo}
  alt="TrackFlow"
  style={{
    height: "150px",
    objectFit: "contain",
  }}
/>
<p
  style={{
    fontSize: "16px",
    color: "#6b7280",
    marginTop: "-5px",
    fontWeight: "500",
  }}
>
  Smart Logistics & Shipment Tracking
</p>

        <nav>
          <a href="#">Home</a>
          <a href="#">Track Shipment</a>
          <a href="#">About</a>
          <motion.button
  onClick={handleLogout}
  whileHover={{ scale: 1.05 }}
  whileTap={{ scale: 0.95 }}
>
  Logout
</motion.button>
        </nav>
      </motion.header>

      <div className="customer-layout">
      <Sidebar
  activeMenu={activeMenu}
  setActiveMenu={setActiveMenu}
  handleLogout={handleLogout}
  notificationCount={notificationCount}
/>

      <motion.main
  className="hero" 
  initial={{ opacity: 0, y: 30 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.7 }}
    >
      <AnimatePresence mode="wait">
             {activeMenu === "orders" && (
               <motion.div
                 key="orders"
                 initial={{ opacity: 0, x: 30 }}
                 animate={{ opacity: 1, x: 0 }}
                 exit={{ opacity: 0, x: -30 }}
                 transition={{ duration: 0.3 }}
               >
                 <MyOrders
                  setTrackingId={setTrackingId}
                  trackShipment={trackShipment}
                  setActiveMenu={setActiveMenu}
                 />
               </motion.div>
             )}
             {activeMenu === "request" && (
               <motion.div
                 key="request"
                 initial={{ opacity: 0, x: 30 }}
                 animate={{ opacity: 1, x: 0 }}
                 exit={{ opacity: 0, x: -30 }}
                 transition={{ duration: 0.3 }}
               >
                 <ShipmentRequest />
               </motion.div>
             )}
             {activeMenu === "profile" && (
               <motion.div
                 key="profile"
                 initial={{ opacity: 0, x: 30 }}
                 animate={{ opacity: 1, x: 0 }}
                 exit={{ opacity: 0, x: -30 }}
                 transition={{ duration: 0.3 }}
               >
                 <Profile />
               </motion.div>
             )}
             {activeMenu === "address" && (
               <motion.div
                 key="address"
                 initial={{ opacity: 0, x: 30 }}
                 animate={{ opacity: 1, x: 0 }}
                 exit={{ opacity: 0, x: -30 }}
                 transition={{ duration: 0.3 }}
               >
                 <Addresses />
               </motion.div>
             )}
            {activeMenu === "notifications" && (
               <motion.div
                 key="notifications"
                 initial={{ opacity: 0, x: 30 }}
                 animate={{ opacity: 1, x: 0 }}
                 exit={{ opacity: 0, x: -30 }}
                 transition={{ duration: 0.3 }}
               >
                 <Notifications
                   fetchNotificationCount={fetchNotificationCount}
                 />
               </motion.div>
             )}
             {activeMenu === "settings" && (
               <motion.div
                 key="settings"
                 initial={{ opacity: 0, x: 30 }}
                 animate={{ opacity: 1, x: 0 }}
                 exit={{ opacity: 0, x: -30 }}
                 transition={{ duration: 0.3 }}
               >
                 <Settings />
               </motion.div>
             )}
         

          {activeMenu === "track" && (
            <motion.div
              key="track"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.3 }}
              style={{ width: "100%" }}
            >
              <TrackShipment
                trackingId={trackingId}
                setTrackingId={setTrackingId}
                trackShipment={trackShipment}
                shipment={shipment}
                error={error}
                steps={steps}
                truckIcon={truckIcon}
              />
    
        {shipment && (
          <motion.section
            className="shipment-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
          </motion.section>
        )}
        </motion.div>
        )}
        </AnimatePresence>
      </motion.main>
    </div>
    </div>
  );
}

export default CustomerDashboard;