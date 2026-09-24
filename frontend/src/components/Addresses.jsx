import React from "react";
import { motion } from "framer-motion";

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

function Addresses() {
  return (
    <div className="profile-page">
      <motion.h1
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        📍 Saved Addresses
      </motion.h1>

      <motion.div
        className="profile-card"
        variants={containerVariants}
        initial="hidden"
        animate="show"
      >
        <motion.h3 variants={itemVariants}>🏠 Home</motion.h3>
        <motion.p variants={itemVariants}>Patna, Bihar</motion.p>

        <motion.h3 variants={itemVariants}>🏢 Office</motion.h3>
        <motion.p variants={itemVariants}>Bhubaneswar, Odisha</motion.p>

        <motion.button
          variants={itemVariants}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Add New Address
        </motion.button>
      </motion.div>
    </div>
  );
}

export default Addresses;
