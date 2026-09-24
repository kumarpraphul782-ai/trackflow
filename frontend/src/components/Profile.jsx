import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import API_URL from "../config";

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.2 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

function Profile() {
    const [user, setUser] = useState(null);
    useEffect(() => {
  const fetchUser = async () => {
    try {
      const token = localStorage.getItem("token");

      const response = await fetch(`${API_URL}/api/auth/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (response.ok) {
        setUser(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  fetchUser();
}, []);
  return (
    <div className="profile-page">
      <motion.h1
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        👤 My Profile
      </motion.h1>

      <motion.div
        className="profile-card"
        variants={containerVariants}
        initial="hidden"
        animate="show"
      >
        <motion.img
          src="https://ui-avatars.com/api/?name=Customer&background=2563eb&color=fff&size=120"
          alt="Profile"
          variants={itemVariants}
          whileHover={{ scale: 1.1, rotate: 5 }}
          transition={{ type: "spring", stiffness: 300 }}
          style={{ borderRadius: "50%" }}
        />

        <motion.h2 variants={itemVariants}>
          {user?.name || "Loading..."}
        </motion.h2>

        <motion.p variants={itemVariants}>
          📧 {user?.email || "Loading..."}
        </motion.p>

        <motion.p variants={itemVariants}>
          📱 {user?.phone || "Loading..."}
        </motion.p>

        <motion.button
          variants={itemVariants}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Edit Profile
        </motion.button>
      </motion.div>
    </div>
  );
}

export default Profile;
