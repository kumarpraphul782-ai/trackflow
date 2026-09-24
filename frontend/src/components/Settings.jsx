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

function Settings() {
  return (
    <div className="profile-page">
      <motion.h1
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        ⚙️ Settings
      </motion.h1>

      <motion.div
        className="profile-card"
        variants={containerVariants}
        initial="hidden"
        animate="show"
      >
        <motion.h3 variants={itemVariants}>Theme</motion.h3>
        <motion.p variants={itemVariants}>Light Mode</motion.p>

        <motion.h3 variants={itemVariants}>Language</motion.h3>
        <motion.p variants={itemVariants}>English</motion.p>

        <motion.button
          variants={itemVariants}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Save Changes
        </motion.button>
      </motion.div>
    </div>
  );
}

export default Settings;
