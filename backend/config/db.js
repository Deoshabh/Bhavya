const mongoose = require("mongoose");

const MAX_RETRIES = 3;
const RETRY_DELAY = 5000; // 5 seconds

const connectWithRetry = async (retryCount = 0) => {
  try {
    // Try multiple environment variable names for MongoDB URI
    const mongoURI =
      process.env.MONGODB_URI ||
      process.env.DB_URI ||
      process.env.DATABASE_URL ||
      "mongodb://admin:StrongPassword123@mongo-db-mongodb-avaxdz:27017/Bhavya_Events?authSource=admin";

    if (!mongoURI || mongoURI === "undefined") {
      throw new Error(
        "MongoDB URI not found in environment variables. Check MONGODB_URI, DB_URI, or DATABASE_URL."
      );
    }

    console.log("Attempting MongoDB connection...");
    console.log(
      "Using URI pattern:",
      mongoURI.replace(/\/\/.*@/, "//***:***@")
    ); // Hide credentials in logs

    const options = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    };

    await mongoose.connect(mongoURI, options);

    console.log("MongoDB Connected Successfully");

    // Handle connection events
    mongoose.connection.on("error", (err) => {
      console.error("MongoDB connection error:", err);
    });

    mongoose.connection.on("disconnected", () => {
      console.warn("MongoDB disconnected. Attempting to reconnect...");
    });

    process.on("SIGINT", async () => {
      try {
        await mongoose.connection.close();
        console.log("MongoDB connection closed through app termination");
        process.exit(0);
      } catch (err) {
        console.error("Error closing MongoDB connection:", err);
        process.exit(1);
      }
    });
  } catch (err) {
    console.error(
      `MongoDB connection attempt ${retryCount + 1} failed:`,
      err.message
    );

    if (retryCount < MAX_RETRIES) {
      console.log(`Retrying in ${RETRY_DELAY / 1000} seconds...`);
      await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY));
      return connectWithRetry(retryCount + 1);
    }

    console.error("Max retry attempts reached. Exiting...");
    process.exit(1);
  }
};

module.exports = connectWithRetry;
