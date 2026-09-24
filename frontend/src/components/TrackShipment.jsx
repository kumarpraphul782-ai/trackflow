import React from "react";
import { motion } from "framer-motion";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
} from "react-leaflet";

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.2 },
  },
};

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

function TrackShipment({
  trackingId,
  setTrackingId,
  trackShipment,
  shipment,
  error,
  steps,
  truckIcon,
}) {
  return (
    <>
      <motion.p
        className="tag"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        SMART LOGISTICS TRACKING
      </motion.p>

      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        Track your shipment
        <br />
        from pickup to delivery.
      </motion.h1>

      <motion.p
        className="description"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        Get complete visibility of your shipment journey.
      </motion.p>

      <motion.div
        className="tracking-box"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <input
          type="text"
          placeholder="Enter Tracking ID"
          value={trackingId}
          onChange={(e) => setTrackingId(e.target.value)}
        />

        <motion.button
          onClick={trackShipment}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Track Shipment
        </motion.button>
      </motion.div>

      <motion.p
        className="example"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        Example: TRK12345678
      </motion.p>

      {error && (
        <motion.p
          className="error-message"
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          {error}
        </motion.p>
      )}

      {shipment && (
        <motion.section
          className="shipment-card"
          initial={{ opacity: 0, y: 30, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <motion.div
            className="shipment-header"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <div>
              <p>Tracking ID</p>
              <h3>{shipment.trackingId}</h3>
            </div>

            <motion.span
              className="status"
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 300, damping: 15 }}
            >
              {shipment.status}
            </motion.span>
          </motion.div>

          <motion.div
            style={{ marginBottom: "20px" }}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            <MapContainer
              center={[23.5937, 80.9629]}
              zoom={5}
              style={{
                height: "350px",
                width: "100%",
                borderRadius: "12px",
              }}
            >
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

              <Marker
                position={[23.5937, 80.9629]}
                icon={truckIcon}
              >
                <Popup>{shipment.status}</Popup>
              </Marker>
            </MapContainer>
          </motion.div>

          <motion.div
            className="route"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            <div>
              <p>FROM</p>
              <h3>📍 {shipment.from}</h3>
            </div>

            <motion.div
              className="route-line"
              animate={{ x: [0, 10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              🚚
            </motion.div>

            <div>
              <p>TO</p>
              <h3>📍 {shipment.to}</h3>
            </div>
          </motion.div>

          <motion.div
            className="timeline"
            variants={containerVariants}
            initial="hidden"
            animate="show"
          >
            {steps.map((step, index) => {
              const currentIndex = steps.indexOf(shipment.status);

              let className = "";

              if (index < currentIndex) className = "completed";
              else if (index === currentIndex) className = "active";

              return (
                <motion.div
                  key={step}
                  className={className}
                  variants={fadeUp}
                  whileHover={{ scale: 1.08 }}
                >
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{
                      type: "spring",
                      stiffness: 400,
                      damping: 15,
                      delay: index * 0.1,
                    }}
                  >
                    {index < currentIndex
                      ? "✓"
                      : index === currentIndex
                      ? "🚚"
                      : "○"}
                  </motion.span>

                  <p>{step}</p>
                </motion.div>
              );
            })}
          </motion.div>
        </motion.section>
      )}
    </>
  );
}

export default TrackShipment;
