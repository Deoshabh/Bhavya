require("dotenv").config();
const express = require("express");
const app = express();

// Trust proxy settings - place this at the top of your file
app.set("trust proxy", true);
app.enable("trust proxy");

const mongoose = require("mongoose");
const connectDB = require("./config/db");
const errorHandler = require("./middleware/errorHandler");
const adminRoutes = require("./routes/adminRoutes");
const eventRoutes = require("./routes/eventRoutes");
const authRoutes = require("./routes/authRoutes");
const ticketRoutes = require("./routes/ticketRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const profileRoutes = require("./routes/profileRoutes");
const path = require("path");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const morgan = require("morgan");
const compression = require("compression");
const cors = require("cors");
const mongoSanitize = require("express-mongo-sanitize");
const xss = require("xss-clean");
const hpp = require("hpp");
const fs = require("fs");

// Trust proxy - this is critical for rate limiting behind a proxy
app.set("trust proxy", "loopback, linklocal, uniquelocal"); // More comprehensive setting

// Security middleware
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: [
          "'self'",
          "'unsafe-inline'",
          "'unsafe-eval'",
          "https://checkout.razorpay.com",
        ],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        fontSrc: ["'self'", "https://fonts.gstatic.com"],
        imgSrc: ["'self'", "data:", "https:", "blob:"],
        connectSrc: ["'self'", "https://api.razorpay.com"],
      },
    },
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: false,
  })
);

// Enhanced CORS configuration with detailed logging
const corsOptions = {
  origin: function (origin, callback) {
    console.log(
      `🌐 CORS Request - Origin: ${
        origin || "No Origin (same-origin/server-to-server)"
      }`
    );

    // Get allowed origins from env, with fallback defaults
    const allowedOrigins = process.env.CORS_ORIGIN
      ? process.env.CORS_ORIGIN.split(",").map((o) => o.trim())
      : ["https://bhavya.org.in", "https://www.bhavya.org.in"];

    console.log("🔒 Configured allowed origins:", allowedOrigins);

    // Allow requests with no Origin (same-origin, server-to-server, mobile apps)
    // Also allow if origin is in our allowed list
    if (!origin || allowedOrigins.includes(origin)) {
      console.log(
        `✅ CORS: Access granted for ${origin || "no-origin request"}`
      );
      callback(null, true);
    } else {
      console.log(`❌ CORS: Origin ${origin} not in allowed list`);
      // For production debugging - allow all for now, comment out for strict CORS
      console.log(
        `⚠️  CORS: Allowing anyway for debugging (remove in production)`
      );
      callback(null, true);
      // Uncomment for strict CORS enforcement:
      // callback(new Error(`Origin ${origin} not allowed by CORS`));
    }
  },
  credentials: true, // Enable credentials support for authentication
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  exposedHeaders: ["Content-Range", "X-Content-Range"],
  maxAge: 86400, // 24 hours
  preflightContinue: false,
  optionsSuccessStatus: 204,
};

// Apply CORS before other middleware that might interfere
app.use(cors(corsOptions));

const corsFallback = require("./middleware/corsFallback");

// Add this after your existing CORS middleware
app.use(corsFallback);

// Data sanitization
app.use(mongoSanitize()); // Against NoSQL injection
app.use(xss()); // Against XSS attacks
app.use(hpp()); // Against HTTP Parameter Pollution

// Compression
app.use(
  compression({
    filter: (req, res) => {
      if (req.headers["x-no-compression"]) return false;
      return compression.filter(req, res);
    },
    level: 6, // Balanced setting between speed and compression
  })
);

// Rate limiting - Global
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: "Too many requests from this IP, please try again later.",
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

// API specific rate limits
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50,
  message: "Too many API requests from this IP, please try again later",
  trustProxy: true, // Explicitly trust the proxy
});
app.use("/api/", apiLimiter);

// Auth route specific limiter
const authLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour window
  max: 5, // start blocking after 5 requests
  message:
    "Too many login attempts from this IP, please try again after an hour",
  trustProxy: true, // Explicitly trust the proxy
});
app.use("/api/auth/login", authLimiter);

// Middleware
app.use(express.json({ limit: "10kb" })); // Body size limit
app.use(express.urlencoded({ extended: true, limit: "10kb" }));

// Logging
if (process.env.NODE_ENV === "production") {
  app.use(
    morgan("combined", {
      skip: (req, res) => res.statusCode < 400,
      stream: require("rotating-file-stream").createStream("access.log", {
        interval: "1d",
        path: path.join(__dirname, "logs"),
      }),
    })
  );
} else {
  app.use(morgan("dev"));
}

// Enhanced Health check endpoint
app.get("/health", (req, res) => {
  console.log("🏥 Health check requested");
  res.status(200).json({
    status: "ok",
    timestamp: new Date().toISOString(),
    uptime: Math.floor(process.uptime()),
    environment: process.env.NODE_ENV || "development",
    version: "1.0.0",
    services: {
      database:
        mongoose.connection.readyState === 1 ? "connected" : "disconnected",
      server: "running",
    },
  });
});

// Favicon handler - redirect to webp favicon
app.get("/favicon.ico", (req, res) => {
  res.redirect(301, "/favicon.webp");
});

// Static favicon.webp fallback
app.get("/favicon.webp", (req, res) => {
  const faviconPath = path.join(
    __dirname,
    "..",
    "frontend",
    "public",
    "favicon.webp"
  );
  if (fs.existsSync(faviconPath)) {
    res.setHeader("Content-Type", "image/webp");
    res.setHeader("Cache-Control", "public, max-age=86400");
    res.sendFile(faviconPath);
  } else {
    res.status(404).send("Favicon not found");
  }
});

// Robots.txt handler
app.get("/robots.txt", (req, res) => {
  const robotsPath = path.join(
    __dirname,
    "..",
    "frontend",
    "public",
    "robots.txt"
  );
  if (fs.existsSync(robotsPath)) {
    res.setHeader("Content-Type", "text/plain");
    res.sendFile(robotsPath);
  } else {
    res.type("text/plain");
    res.send("User-agent: *\nDisallow:");
  }
});

// Add this before the API routes
app.get("/", (req, res) => {
  res.json({
    status: "success",
    message: "Welcome to the API",
    version: "1.0.0",
    endpoints: {
      health: "/health",
      api: "/api",
      docs: "/api-docs",
    },
  });
});

// Fix for static files - ensure these lines are BEFORE the API routes
// Create absolute paths to uploads directories
const uploadsPath = path.resolve(__dirname, "uploads");
const adminUploadsPath = path.resolve(uploadsPath, "admin");
const eventsUploadsPath = path.resolve(uploadsPath, "events");
const profilesUploadsPath = path.resolve(uploadsPath, "profiles");

console.log("Uploads directories:");
console.log("- Main:", uploadsPath);
console.log("- Admin:", adminUploadsPath);
console.log("- Events:", eventsUploadsPath);
console.log("- Profiles:", profilesUploadsPath);

// Ensure all upload directories exist
[uploadsPath, adminUploadsPath, eventsUploadsPath, profilesUploadsPath].forEach(
  (dir) => {
    if (!fs.existsSync(dir)) {
      console.log(`Creating directory: ${dir}`);
      fs.mkdirSync(dir, { recursive: true });

      // Set proper permissions on Unix systems
      if (process.platform !== "win32") {
        try {
          fs.chmodSync(dir, 0o755);
          console.log(`Set permissions on: ${dir}`);
        } catch (err) {
          console.error(`Error setting permissions on ${dir}:`, err);
        }
      }
    }
  }
);

// Improved static file serving for uploads
app.use(
  "/uploads",
  (req, res, next) => {
    console.log("Static file request for:", req.path);
    next();
  },
  express.static(uploadsPath, {
    dotfiles: "ignore",
    etag: true,
    maxAge: "1d",
    setHeaders: function (res, path, stat) {
      // Set proper CORS headers
      res.set("Access-Control-Allow-Origin", "*");

      // Set cache control
      res.set("Cache-Control", "public, max-age=86400");

      // Set appropriate content type based on file extension
      if (path.endsWith(".jpg") || path.endsWith(".jpeg")) {
        res.set("Content-Type", "image/jpeg");
      } else if (path.endsWith(".png")) {
        res.set("Content-Type", "image/png");
      } else if (path.endsWith(".gif")) {
        res.set("Content-Type", "image/gif");
      } else if (path.endsWith(".webp")) {
        res.set("Content-Type", "image/webp");
      }

      console.log(
        "Serving static file:",
        path,
        "with Content-Type:",
        res.get("Content-Type")
      );
    },
  })
);

// Enhanced file checking endpoint
app.get("/check-image/:subdir?/:filename", (req, res) => {
  const { subdir, filename } = req.params;

  // Sanitize inputs to prevent path traversal
  const sanitizedSubdir = subdir ? subdir.replace(/[^a-z0-9]/gi, "") : "";
  const sanitizedFilename = filename
    ? filename.replace(/[^a-z0-9_\-.]/gi, "")
    : "";

  // Determine file path based on whether subdir is provided
  const filePath = sanitizedSubdir
    ? path.join(uploadsPath, sanitizedSubdir, sanitizedFilename)
    : path.join(uploadsPath, sanitizedFilename);

  console.log("Checking image at path:", filePath);

  if (fs.existsSync(filePath)) {
    try {
      const stats = fs.statSync(filePath);
      const ext = path.extname(filePath).toLowerCase();
      let contentType = "application/octet-stream";

      // Determine content type
      if (ext === ".jpg" || ext === ".jpeg") contentType = "image/jpeg";
      else if (ext === ".png") contentType = "image/png";
      else if (ext === ".gif") contentType = "image/gif";
      else if (ext === ".webp") contentType = "image/webp";

      // If the check parameter is not directly set, we'll return the actual image
      if (req.query.check !== "true") {
        res.set("Content-Type", contentType);
        return fs.createReadStream(filePath).pipe(res);
      }

      // If check=true, return metadata about the file
      res.json({
        exists: true,
        size: stats.size,
        path: filePath,
        contentType,
        publicUrl: `${req.protocol}://${req.get("host")}/uploads/${
          sanitizedSubdir ? sanitizedSubdir + "/" : ""
        }${sanitizedFilename}`,
      });
    } catch (err) {
      console.error("Error checking file:", err);
      res.status(500).json({
        exists: true,
        error: "Error reading file stats",
        message: err.message,
      });
    }
  } else {
    res.status(404).json({
      exists: false,
      checkedPath: filePath,
      message: "File not found",
    });
  }
});

// Ensure serving static files for uploaded images
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/tickets", ticketRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/profile", profileRoutes);

// Add additional mounting point for auth routes without the /api prefix
// This ensures compatibility with frontend requests to /auth/register
app.use("/auth", authRoutes);
// Also mount profile routes without /api prefix for compatibility
app.use("/profile", profileRoutes);

// Enhanced React Frontend Serving Configuration
// Serve frontend in production and when build exists
console.log("🎯 Configuring React frontend serving...");

// Use absolute path resolution with proper fallbacks
const frontendPath = process.env.FRONTEND_BUILD_PATH
  ? path.resolve(process.env.FRONTEND_BUILD_PATH)
  : path.resolve(__dirname, "..", "frontend", "build");

console.log(`📁 Looking for React build at: ${frontendPath}`);
console.log(`🔧 Environment mode: ${process.env.NODE_ENV || "development"}`);

try {
  // Check if directory exists
  if (fs.existsSync(frontendPath)) {
    console.log(`✅ React build found at: ${frontendPath}`);

    // List contents for debugging
    const buildContents = fs.readdirSync(frontendPath);
    console.log(
      `📂 Build directory contents: ${buildContents.slice(0, 5).join(", ")}${
        buildContents.length > 5 ? "..." : ""
      }`
    );

    // Serve static files with explicit options and enhanced caching
    app.use(
      express.static(frontendPath, {
        index: false, // Don't auto-serve index.html for directories
        setHeaders: (res, filePath) => {
          const fileName = path.basename(filePath);
          console.log(`📤 Serving static file: ${fileName}`);

          // Set proper caching headers for static assets
          if (filePath.endsWith(".html")) {
            // Don't cache HTML files for fresh updates
            res.setHeader(
              "Cache-Control",
              "no-cache, no-store, must-revalidate"
            );
            res.setHeader("Pragma", "no-cache");
            res.setHeader("Expires", "0");
          } else if (filePath.match(/\.(js|css)$/)) {
            // Cache JS/CSS for 1 year (they have hashes)
            res.setHeader(
              "Cache-Control",
              "public, max-age=31536000, immutable"
            );
          } else if (filePath.match(/\.(png|jpg|jpeg|gif|ico|svg|webp)$/)) {
            // Cache images for 1 week
            res.setHeader("Cache-Control", "public, max-age=604800");
          } else {
            // Default cache for other files
            res.setHeader("Cache-Control", "public, max-age=86400");
          }
        },
      })
    );

    // Enhanced client-side routing handler with better logging
    app.get("*", (req, res, next) => {
      // Skip API routes, health checks, uploads, and other server routes
      if (
        req.path.startsWith("/api") ||
        req.path === "/health" ||
        req.path.startsWith("/uploads") ||
        req.path.startsWith("/check-image") ||
        req.path.startsWith("/auth") ||
        req.path.startsWith("/profile") ||
        req.path === "/favicon.ico" ||
        req.path === "/favicon.webp" ||
        req.path === "/robots.txt"
      ) {
        return next();
      }

      const indexPath = path.join(frontendPath, "index.html");
      console.log(
        `🔄 Client-side route detected: ${req.path} → serving React app`
      );

      if (fs.existsSync(indexPath)) {
        console.log(`✅ Serving React app from: ${path.basename(indexPath)}`);
        res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
        res.sendFile(indexPath);
      } else {
        console.error(`❌ Index file not found at: ${indexPath}`);
        res.status(404).send(`
          <h1>🚫 Frontend Not Available</h1>
          <p><strong>Error:</strong> React build not found</p>
          <p><strong>Expected location:</strong> ${indexPath}</p>
          <p><strong>Solution:</strong> Run <code>npm run build</code> in the frontend directory</p>
          <hr>
          <p>✅ API endpoints are still available at <a href="/api">/api</a></p>
          <p>✅ Health check: <a href="/health">/health</a></p>
        `);
      }
    });
  } else {
    console.log(`ℹ️  React build directory not found at: ${frontendPath}`);
    console.log(`� Frontend will not be served. API-only mode active.`);

    // Fallback handler for missing frontend
    app.get("*", (req, res, next) => {
      // Skip API and server routes
      if (
        req.path.startsWith("/api") ||
        req.path === "/health" ||
        req.path.startsWith("/uploads") ||
        req.path.startsWith("/check-image") ||
        req.path.startsWith("/auth") ||
        req.path.startsWith("/profile") ||
        req.path === "/favicon.ico" ||
        req.path === "/favicon.webp" ||
        req.path === "/robots.txt"
      ) {
        return next();
      }

      console.log(
        `ℹ️  Frontend request for: ${req.path} (build not available)`
      );
      res.status(503).send(`
        <h1>🚧 Frontend Build Required</h1>
        <p><strong>Status:</strong> React frontend not built yet</p>
        <p><strong>Missing:</strong> ${frontendPath}</p>
        <h3>🛠️ Setup Instructions:</h3>
        <ol>
          <li>Navigate to the frontend directory</li>
          <li>Run <code>npm install</code></li>
          <li>Run <code>npm run build</code></li>
          <li>Restart this server</li>
        </ol>
        <hr>
        <p>✅ <strong>API Status:</strong> Available at <a href="/api">/api</a></p>
        <p>✅ <strong>Health Check:</strong> <a href="/health">/health</a></p>
        <p>🔧 <strong>Environment:</strong> ${
          process.env.NODE_ENV || "development"
        }</p>
      `);
    });
  }
} catch (err) {
  console.error(`❌ Error setting up React frontend serving: ${err.message}`);
}

// Error handling middleware
app.use(errorHandler);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    status: "error",
    message: "Route not found",
  });
});

// Global error handler
app.use((err, req, res, next) => {
  const status = err.status || 500;
  const message =
    process.env.NODE_ENV === "production"
      ? "Internal server error"
      : err.message;

  // Log error
  console.error(err);

  res.status(status).json({
    status: "error",
    message,
    ...(process.env.NODE_ENV !== "production" && { stack: err.stack }),
  });
});

// Enhanced server startup with comprehensive logging
const startServer = async () => {
  try {
    console.log("🚀 Starting Bhavya Events Server...");
    console.log("" + "=".repeat(50));

    // Enhanced environment debug info
    console.log("🔧 Environment Configuration:");
    console.log("- NODE_ENV:", process.env.NODE_ENV || "development");
    console.log("- APP_PORT:", process.env.APP_PORT || "not set");
    console.log("- PORT:", process.env.PORT || "not set");
    console.log(
      "- FRONTEND_BUILD_PATH:",
      process.env.FRONTEND_BUILD_PATH || "default"
    );
    console.log("- MONGODB_URI exists:", !!process.env.MONGODB_URI);
    console.log("- DB_URI exists:", !!process.env.DB_URI);
    console.log("- DATABASE_URL exists:", !!process.env.DATABASE_URL);
    console.log("- CORS_ORIGIN:", process.env.CORS_ORIGIN || "default");
    console.log("" + "=".repeat(50));

    // Connect to MongoDB with enhanced logging
    console.log("📊 Connecting to MongoDB...");
    await connectDB();
    console.log("✅ MongoDB Connected Successfully");

    // Use APP_PORT from environment with proper fallback chain
    const port = process.env.APP_PORT || process.env.PORT || 5002;
    console.log(
      `🌐 Using port: ${port} (source: ${
        process.env.APP_PORT
          ? "APP_PORT"
          : process.env.PORT
          ? "PORT"
          : "default"
      })`
    );

    const server = app.listen(port, "0.0.0.0", () => {
      console.log("" + "=".repeat(50));
      console.log("🎉 SERVER SUCCESSFULLY STARTED");
      console.log("" + "=".repeat(50));
      console.log(`🚀 Environment: ${process.env.NODE_ENV || "development"}`);
      console.log(`🌐 Server running on: http://0.0.0.0:${port}`);
      console.log(`📡 API endpoints: http://localhost:${port}/api`);
      console.log(`❤️  Health check: http://localhost:${port}/health`);
      console.log(
        `📱 Frontend: ${
          process.env.NODE_ENV === "production"
            ? "Serving React build"
            : "API only mode"
        }`
      );
      console.log("" + "=".repeat(50));
      console.log("🔗 Available endpoints:");
      console.log("   GET  /health          - Health check");
      console.log("   GET  /api/*           - API routes");
      console.log("   GET  /*               - React frontend (production)");
      console.log("" + "=".repeat(50));
      console.log("🎯 Server ready to accept connections!");
    });

    // Enhanced graceful shutdown handlers
    const gracefulShutdown = (signal) => {
      console.log(`\n⚠️  Received ${signal}. Starting graceful shutdown...`);
      gracefulShutdownHandler(server);
    };

    process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
    process.on("SIGINT", () => gracefulShutdown("SIGINT"));
  } catch (error) {
    console.error("❌ Failed to start server:");
    console.error("💥 Error:", error.message);
    console.error("📍 Stack:", error.stack);
    process.exit(1);
  }
};

async function gracefulShutdownHandler(server) {
  console.log("🛑 Starting graceful shutdown process...");

  try {
    // Close MongoDB connection
    console.log("📊 Closing MongoDB connection...");
    await mongoose.connection.close();
    console.log("✅ MongoDB connection closed successfully");

    // Close Express server
    console.log("🌐 Closing HTTP server...");
    server.close(() => {
      console.log("✅ HTTP server closed successfully");
      console.log("👋 Graceful shutdown completed");
      process.exit(0);
    });

    // Force close after 10 seconds if graceful shutdown fails
    setTimeout(() => {
      console.error("⚠️  Graceful shutdown timeout - forcing exit");
      process.exit(1);
    }, 10000);
  } catch (error) {
    console.error("❌ Error during graceful shutdown:", error.message);
    process.exit(1);
  }
}

// Start the server
startServer();
