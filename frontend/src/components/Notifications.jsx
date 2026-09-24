import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import API_URL from "../config";

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, x: -20 },
  show: { opacity: 1, x: 0, transition: { duration: 0.4 } },
};

function Notifications({ fetchNotificationCount }) {
    const [notifications, setNotifications] = useState([]);
    useEffect(() => {
        const fetchNotifications = async () => {
  try {
    const user = JSON.parse(localStorage.getItem("user"));

    const response = await fetch(
      `${API_URL}/api/notifications/${user._id}`
    );

    const data = await response.json();

    if (response.ok) {
  setNotifications(data);

  await fetch(
    `${API_URL}/api/notifications/read/${user._id}`,
    {
      method: "PUT",
    }
  );
  fetchNotificationCount();
}
  } catch (error) {
    console.error(error);
  }
};
  fetchNotifications();
}, []);
  return (
    <div className="profile-page">
      <motion.h1
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        🔔 Notifications
      </motion.h1>

      <motion.div
        className="profile-card"
        variants={containerVariants}
        initial="hidden"
        animate="show"
      >
  {notifications.length === 0 ? (
    <motion.p
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.2 }}
    >
      No notifications yet.
    </motion.p>
  ) : (
    notifications.map((notification) => (
      <motion.p
        key={notification._id}
        variants={itemVariants}
        whileHover={{ x: 5, backgroundColor: "rgba(255,255,255,0.15)" }}
        style={{ padding: "12px", borderRadius: "8px", marginBottom: "8px" }}
      >
        {notification.message}
      </motion.p>
    ))
  )}
</motion.div>
    </div>
  );
}

export default Notifications;
