require('dotenv').config();
const mongoose = require('mongoose');
const Admin = require('../models/Admin');

const createSuperAdmin = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });

        console.log('Connected to MongoDB');

        // Super admin details
        const superAdminData = {
            name: 'Super Admin',
            email: 'admin@exhibition.com',
            password: 'Admin@123',
            role: 'super_admin',
            permissions: [
                'manage_users',
                'manage_events',
                'manage_tickets',
                'manage_exhibitors'
            ],
            status: 'active'
        };

        // Check if super admin already exists
        const existingAdmin = await Admin.findOne({ email: superAdminData.email });
        
        if (existingAdmin) {
            console.log('Super admin already exists');
            process.exit(0);
        }

        // Create super admin
        const superAdmin = new Admin(superAdminData);
        await superAdmin.save();

        console.log('Super admin created successfully');
        console.log('Email:', superAdminData.email);
        console.log('Password:', superAdminData.password);
        console.log('Please change the password after first login');

    } catch (error) {
        console.error('Error creating super admin:', error);
    } finally {
        await mongoose.disconnect();
        process.exit(0);
    }
};

createSuperAdmin(); 