import logo from "../assets/trackflow-logo.png";
import { useNavigate } from "react-router-dom";
import "./LandingPage.css";
import { FaTruck, FaMapMarkerAlt, FaBoxOpen, FaShoppingBasket, FaStore } from "react-icons/fa";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import { useRef } from "react";

const floatVariants = {
  animate: (i) => ({
    y: [0, -20, 0],
    transition: {
      duration: 3 + i * 0.5,
      repeat: Infinity,
      ease: "easeInOut",
    },
  }),
};

const staggerContainer = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.15, delayChildren: 0.2 },
  },
};

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: "easeOut" } },
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.8 },
  show: { opacity: 1, scale: 1, transition: { duration: 0.8, ease: "easeOut" } },
};

const slideInLeft = {
  hidden: { opacity: 0, x: -80 },
  show: { opacity: 1, x: 0, transition: { duration: 0.8, ease: "easeOut" } },
};

const slideInRight = {
  hidden: { opacity: 0, x: 80 },
  show: { opacity: 1, x: 0, transition: { duration: 0.8, ease: "easeOut" } },
};

function LandingPage() {
  const navigate = useNavigate();
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll();
  const yParallax = useTransform(scrollYProgress, [0, 1], [0, -150]);
  const smoothY = useSpring(yParallax, { stiffness: 50, damping: 20 });

  return (
    <div className="landing-page">
      <motion.nav
        className="navbar"
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <img
          src={logo}
          alt="TrackFlow"
          style={{ height: "200px", objectFit: "contain" }}
        />

        <div className="nav-links">
          <motion.a href="#home" whileHover={{ scale: 1.1 }}>Home</motion.a>
          <motion.a href="#features" whileHover={{ scale: 1.1 }}>Features</motion.a>
          <motion.a href="#contact" whileHover={{ scale: 1.1 }}>Contact</motion.a>

          <motion.button
            className="login-btn"
            onClick={() => navigate("/login")}
            whileHover={{ scale: 1.05, boxShadow: "0 0 35px rgba(37,99,235,0.6)" }}
            whileTap={{ scale: 0.95 }}
          >
            Login
          </motion.button>
        </div>
      </motion.nav>

      <section className="services-section" id="services">
        <motion.div
          className="services-container"
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
          variants={staggerContainer}
        >
          <motion.h2 className="features-title" variants={fadeUp}>
            What do you need today?
          </motion.h2>

          <motion.p className="services-subtitle" variants={fadeUp}>
            Track an existing order or discover shops near you and order
            food, groceries &amp; more.
          </motion.p>

          <div className="services-grid">
            <motion.div
              className="service-card service-track"
              variants={slideInLeft}
              whileHover={{ y: -10, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              transition={{ duration: 0.3 }}
              onClick={() => {
                const role = localStorage.getItem("role");
                if (localStorage.getItem("token") && role === "customer") {
                  navigate("/customer");
                } else {
                  navigate("/login");
                }
              }}
            >
              <motion.div
                className="service-icon"
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              >
                <FaTruck />
              </motion.div>
              <h3>Track Order</h3>
              <p>
                Have an existing shipment? Enter your tracking ID and follow
                your order in real-time from pickup to delivery.
              </p>
              <motion.span
                className="service-cta"
                whileHover={{ x: 5 }}
                transition={{ duration: 0.2 }}
              >
                Track Now →
              </motion.span>
            </motion.div>

            <motion.div
              className="service-card service-shop"
              variants={slideInRight}
              whileHover={{ y: -10, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              transition={{ duration: 0.3 }}
              onClick={() => {
                const role = localStorage.getItem("role");
                if (localStorage.getItem("token") && role === "customer") {
                  navigate("/marketplace");
                } else {
                  navigate("/login");
                }
              }}
            >
              <motion.div
                className="service-icon"
                animate={{ rotate: [0, 8, -8, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              >
                <FaShoppingBasket />
              </motion.div>
              <h3>Order Food &amp; Groceries</h3>
              <p>
                Pick a store — restaurant, cafe or grocery — browse their
                catalog and order what you need, delivered to your door.
              </p>
              <motion.span
                className="service-cta"
                whileHover={{ x: 5 }}
                transition={{ duration: 0.2 }}
              >
                Browse Stores →
              </motion.span>
            </motion.div>
          </div>

          <motion.div
            className="own-shop-banner"
            variants={fadeUp}
            whileHover={{ boxShadow: "0 0 40px rgba(76,201,255,0.25)" }}
          >
            <FaStore className="own-shop-icon" />
            <div>
              <h3>Own a restaurant, cafe or grocery shop?</h3>
              <p>
                List your shop on TrackFlow, get approved by our team and
                start selling to thousands of customers.
              </p>
            </div>
            <motion.button
              className="own-shop-btn"
              onClick={() => navigate("/signup")}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              List Your Shop
            </motion.button>
          </motion.div>
        </motion.div>
      </section>

      <section className="hero" id="home" ref={heroRef}>
        <motion.div className="glow glow1" style={{ y: smoothY }} />
        <motion.div className="glow glow2" style={{ y: smoothY }} />
        <motion.div className="glow glow3" style={{ y: smoothY }} />

        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="floating-particle"
            custom={i}
            variants={floatVariants}
            animate="animate"
            style={{
              left: `${15 + i * 14}%`,
              top: `${20 + (i % 3) * 25}%`,
              width: `${6 + i * 2}px`,
              height: `${6 + i * 2}px`,
            }}
          />
        ))}

        <motion.div
          className="hero-content"
          variants={staggerContainer}
          initial="hidden"
          animate="show"
        >
          <motion.div className="hero-left" variants={slideInLeft}>
            <motion.p className="tag" variants={fadeUp}>
              SMART LOGISTICS PLATFORM
            </motion.p>

            <motion.h1 variants={fadeUp}>
              Track Every Shipment
              <br />
              Anywhere. Anytime.
            </motion.h1>

            <motion.p className="description" variants={fadeUp}>
              AI-powered logistics tracking with secure shipment management and
              real-time delivery updates.
            </motion.p>

            <motion.div className="hero-buttons" variants={fadeUp}>
              <motion.button
                className="primary-btn"
                onClick={() => navigate("/login")}
                whileHover={{ scale: 1.05, boxShadow: "0 0 40px rgba(37,99,235,0.5)" }}
                whileTap={{ scale: 0.95 }}
              >
                Track Shipment
              </motion.button>

              <motion.button
                className="secondary-btn"
                onClick={() => navigate("/signup")}
                whileHover={{ scale: 1.05, backgroundColor: "#4cc9ff", color: "#000" }}
                whileTap={{ scale: 0.95 }}
              >
                Create Account
              </motion.button>
            </motion.div>
          </motion.div>

          <motion.div className="hero-right" variants={slideInRight}>
            <motion.div
              className="map-card"
              whileHover={{ boxShadow: "0 0 60px rgba(76,201,255,0.25), 0 30px 70px rgba(0,0,0,0.4)" }}
              transition={{ duration: 0.4 }}
            >
              <div className="world-grid"></div>
              <div className="road"></div>
              <motion.div
                className="route-line"
                animate={{ opacity: [0.3, 1, 0.3] }}
                transition={{ duration: 2, repeat: Infinity }}
              />

              <motion.div
                animate={{ x: [0, 280, 0] }}
                transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
                style={{ position: "absolute", bottom: 80, left: 40 }}
              >
                <FaTruck className="truck-icon-static" />
                <motion.div
                  className="truck-light"
                  animate={{ opacity: [0.4, 1, 0.4] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                />
              </motion.div>

              <motion.div
                className="pin pin1"
                animate={{ scale: [1, 1.3, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <FaMapMarkerAlt />
              </motion.div>

              <motion.div
                className="pin pin2"
                animate={{ scale: [1, 1.3, 1] }}
                transition={{ duration: 2, repeat: Infinity, delay: 1 }}
              >
                <FaMapMarkerAlt />
              </motion.div>

              <motion.div
                className="box box1"
                animate={{ y: [0, -15, 0] }}
                transition={{ duration: 3, repeat: Infinity }}
              >
                <FaBoxOpen />
              </motion.div>

              <motion.div
                className="box box2"
                animate={{ y: [0, -15, 0] }}
                transition={{ duration: 3, repeat: Infinity, delay: 1.5 }}
              >
                <FaBoxOpen />
              </motion.div>
            </motion.div>
          </motion.div>
        </motion.div>
      </section>

      <section className="features-section" id="features">
        <motion.div
          className="features-container"
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
          variants={staggerContainer}
        >
          <motion.h2 className="features-title" variants={fadeUp}>
            Why Choose TrackFlow?
          </motion.h2>

          <div className="features-grid">
            {[
              { icon: "📦", title: "Real-Time Tracking", desc: "Track your shipments live with GPS-powered location updates and instant status notifications." },
              { icon: "🔒", title: "Secure Delivery", desc: "OTP-verified pickups and deliveries ensure your parcels reach the right hands." },
              { icon: "⚡", title: "Instant Updates", desc: "Get real-time notifications via WebSocket for every status change in your shipment journey." },
              { icon: "📊", title: "Smart Analytics", desc: "Visual dashboards with charts and insights for admins to manage logistics efficiently." },
            ].map((feature, i) => (
              <motion.div
                key={i}
                className="feature-card"
                variants={fadeUp}
                whileHover={{ y: -10, boxShadow: "0 20px 50px rgba(76,201,255,0.2)" }}
                transition={{ duration: 0.3 }}
              >
                <motion.div
                  className="feature-icon"
                  animate={{ rotate: [0, 5, -5, 0] }}
                  transition={{ duration: 4, repeat: Infinity, delay: i * 0.5 }}
                >
                  {feature.icon}
                </motion.div>
                <h3>{feature.title}</h3>
                <p>{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      <section className="stats-section">
        <motion.div
          className="stats-container"
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
          variants={staggerContainer}
        >
          {[
            { number: "10K+", label: "Shipments Delivered" },
            { number: "500+", label: "Happy Customers" },
            { number: "50+", label: "Delivery Partners" },
            { number: "99.9%", label: "On-Time Rate" },
          ].map((stat, i) => (
            <motion.div
              key={i}
              className="stat-item"
              variants={scaleIn}
              whileHover={{ scale: 1.08 }}
            >
              <motion.h2
                initial={{ opacity: 0, scale: 0.5 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.15 }}
              >
                {stat.number}
              </motion.h2>
              <p>{stat.label}</p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      <motion.footer
        className="landing-footer"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
      >
        <p>&copy; 2026 TrackFlow. Smart Logistics Platform.</p>
      </motion.footer>
    </div>
  );
}

export default LandingPage;
