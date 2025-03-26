const mongoose = require('mongoose');
const Admin = require('../models/Admin');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const createDefaultAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        // Delete existing admin if exists
        await Admin.deleteOne({ email: 'admin@exhibitionhub.com' });
        console.log('Cleaned up existing admin');

        // Create new admin
        const admin = new Admin({
            name: 'Admin User',
            email: 'admin@exhibitionhub.com',
            password: 'admin123', // Will be hashed by the pre-save hook
            role: 'admin',
            status: 'active',
            permissions: ['manage_users', 'manage_events', 'manage_tickets', 'manage_exhibitors']
        });

        await admin.save();
        console.log('Admin user created successfully');
        console.log('Email: admin@exhibitionhub.com');
        console.log('Password: admin123');

    } catch (error) {
        console.error('Error creating admin:', error);
    } finally {
        await mongoose.connection.close();
    }
};

createDefaultAdmin(); 