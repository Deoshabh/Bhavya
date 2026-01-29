require("dotenv").config();
const express = require("express");
const path = require("path");
const fs = require("fs");
const mongoose = require("mongoose");

const app = express();

/* ======================
   TRUST PROXY (DOKPLOY)
====================== */
app.set("trust proxy", true);

/* ======================
   CORE MIDDLEWARE
====================== */
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));

/* ======================
   SECURITY & UTILS
====================== */
const helmet = require("helmet");
const cors = require("cors");
const compression = require("compression");
const mongoSanitize = require("express-mongo-sanitize");
const xss = require("xss-clean");
const hpp = require("hpp");

app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(cors({
  origin: [
    "https://bhavya.org.in",
    "https://www.bhavya.org.in"
  ],
  credentials: true
}));
app.use(mongoSanitize());
app.use(xss());
app.use(hpp());
app.use(compression());

/* ======================
   DATABASE
====================== */
const connectDB = require("./config/db");
connectDB();

/* ======================
   HEALTH CHECK
====================== */
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    uptime: process.uptime(),
    env: process.env.NODE_ENV || "development"
  });
});

/* ======================
   UPLOADS (STATIC)
====================== */
const uploadsPath = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsPath)) {
  fs.mkdirSync(uploadsPath, { recursive: true });
}
app.use("/uploads", express.static(uploadsPath));

/* ======================
   API ROUTES
====================== */
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/admin", require("./routes/adminRoutes"));
app.use("/api/events", require("./routes/eventRoutes"));
app.use("/api/tickets", require("./routes/ticketRoutes"));
app.use("/api/payments", require("./routes/paymentRoutes"));
app.use("/api/profile", require("./routes/profileRoutes"));

/* ======================
   REACT FRONTEND (FIX)
====================== */
const frontendPath =
  process.env.FRONTEND_BUILD_PATH ||
  path.join(__dirname, "..", "frontend", "build");

console.log("🌐 Frontend path:", frontendPath);

if (fs.existsSync(frontendPath)) {
  console.log("✅ React build found");

  // Serve static assets
  app.use(express.static(frontendPath));

  // SINGLE React fallback — LAST ROUTE
  app.get("*", (req, res) => {
    res.sendFile(path.join(frontendPath, "index.html"));
  });
} else {
  console.log("❌ React build NOT found");

  app.get("*", (req, res) => {
    res.status(503).send("Frontend build not available");
  });
}

/* ======================
   SERVER START
====================== */
const PORT = process.env.APP_PORT || process.env.PORT || 5002;

app.listen(PORT, "0.0.0.0", () => {
  console.log("================================");
  console.log("🚀 SERVER STARTED");
  console.log(`🌐 http://0.0.0.0:${PORT}`);
  console.log(`❤️  /health`);
  console.log(`📡 /api/*`);
  console.log("================================");
});
