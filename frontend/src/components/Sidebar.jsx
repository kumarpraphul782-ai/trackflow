import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

const sidebarItems = [
  { key: "track", icon: "🚚", label: "Track Shipment" },
  { key: "orders", icon: "📦", label: "My Orders" },
  {
    key: "marketplace",
    icon: "🛒",
    label: "Order From Store",
    redirect: "/marketplace",
  },
  { key: "request", icon: "➕", label: "Create Shipment Request" },
  { key: "profile", icon: "👤", label: "Profile" },
  { key: "address", icon: "📍", label: "Addresses" },
  { key: "notifications", icon: "🔔", label: "Notifications", hasBadge: true },
  { key: "settings", icon: "⚙️", label: "Settings" },
];

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.05, delayChildren: 0.2 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, x: -20 },
  show: { opacity: 1, x: 0, transition: { duration: 0.3 } },
};

function Sidebar({
  activeMenu,
  setActiveMenu,
  handleLogout,
  notificationCount,
}) {
  const navigate = useNavigate();

  return (
    <motion.aside
      className="sidebar"
      initial={{ x: -260, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      <motion.h3
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        Customer Panel
      </motion.h3>

      <motion.ul
        variants={containerVariants}
        initial="hidden"
        animate="show"
      >
        {sidebarItems.map((item) => (
          <motion.li
            key={item.key}
            className={
              activeMenu === item.key
                ? "active"
                : item.redirect
                ? "sidebar-store-link"
                : ""
            }
            onClick={() =>
              item.redirect ? navigate(item.redirect) : setActiveMenu(item.key)
            }
            variants={itemVariants}
            whileHover={{ x: 6, backgroundColor: activeMenu === item.key ? "#2563eb" : "#eff6ff" }}
            whileTap={{ scale: 0.97 }}
            transition={{ duration: 0.15 }}
          >
            {item.icon} {item.label}
            {item.hasBadge && notificationCount > 0 && (
              <motion.span
                className="notification-badge"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 500, damping: 15 }}
              >
                {notificationCount}
              </motion.span>
            )}
          </motion.li>
        ))}

        <motion.li
          onClick={handleLogout}
          variants={itemVariants}
          whileHover={{ x: 6, backgroundColor: "#fef2f2", color: "#dc2626" }}
          whileTap={{ scale: 0.97 }}
          transition={{ duration: 0.15 }}
          style={{ marginTop: "10px", borderTop: "1px solid #e5e7eb", paddingTop: "14px" }}
        >
          🚪 Logout
        </motion.li>
      </motion.ul>
    </motion.aside>
  );
}

export default Sidebar;
