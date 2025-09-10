// MongoDB initialization script for local development
// This script creates the necessary database and collections

// Switch to the bhavya_Events database
db = db.getSiblingDB("bhavya_Events");

// Create collections with basic indexes for better performance
db.createCollection("users");
db.createCollection("events");
db.createCollection("tickets");
db.createCollection("bookings");
db.createCollection("profiles");
db.createCollection("admins");
db.createCollection("auditlogs");

// Create indexes for better query performance
db.users.createIndex({ email: 1 }, { unique: true });
db.users.createIndex({ createdAt: 1 });

db.events.createIndex({ title: "text", description: "text" });
db.events.createIndex({ startDate: 1 });
db.events.createIndex({ category: 1 });
db.events.createIndex({ status: 1 });

db.tickets.createIndex({ eventId: 1 });
db.tickets.createIndex({ price: 1 });

db.bookings.createIndex({ userId: 1 });
db.bookings.createIndex({ eventId: 1 });
db.bookings.createIndex({ bookingDate: 1 });
db.bookings.createIndex({ status: 1 });

db.profiles.createIndex({ userId: 1 }, { unique: true });

db.admins.createIndex({ email: 1 }, { unique: true });
db.admins.createIndex({ role: 1 });

db.auditlogs.createIndex({ createdAt: 1 });
db.auditlogs.createIndex({ action: 1 });

print("Database initialized successfully with collections and indexes");
