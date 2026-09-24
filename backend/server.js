const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();

const http = require("http");
const { Server } = require("socket.io");

const authRoutes = require("./routes/auth");
const shipmentsRoutes = require("./routes/shipments");
const requestsRoutes = require("./routes/requests");
const notificationsRoutes = require("./routes/notifications");
const usersRoutes = require("./routes/users");
const marketplaceRoutes = require("./routes/marketplace");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: ["http://localhost:3000", "http://localhost:5173", "http://localhost:5174"],
    methods: ["GET", "POST", "PUT", "DELETE"],
  },
});

// Global middleware
app.use(
  cors({
    origin: ["http://localhost:3000", "http://localhost:5173", "http://localhost:5174"],
    methods: ["GET", "POST", "PUT", "DELETE"],
  })
);
app.use(express.json());

// Socket.IO connection
io.on("connection", (socket) => {
  console.log("🟢 Client Connected:", socket.id);

  socket.on("test", () => {
    console.log("✅ Test event received");
  });

  socket.on("disconnect", () => {
    console.log("🔴 Client Disconnected:", socket.id);
  });
});

// Health check routes
app.get("/api/test", (req, res) => {
  res.send("Backend Working");
});

app.get("/", (req, res) => {
  res.send("TrackFlow Backend is Running!");
});

// API routes
app.use("/api/auth", authRoutes);
app.use("/api", shipmentsRoutes(io));
app.use("/api", requestsRoutes(io));
app.use("/api", notificationsRoutes);
app.use("/api", usersRoutes);
app.use("/api", marketplaceRoutes(io));

// Database connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected Successfully!"))
  .catch((err) => console.log("MongoDB Connection Error:", err));

const PORT = 5001;

server.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});