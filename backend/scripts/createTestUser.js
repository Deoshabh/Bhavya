const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

const createTestUser = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        
        // Create a test user if none exists
        const existingUser = await User.findOne({ email: 'test@example.com' });
        if (!existingUser) {
            const user = new User({
                name: 'Test User',
                email: 'test@example.com',
                password: 'password123',
                role: 'organizer'
            });
            await user.save();
            console.log('Test user created successfully!');
        } else {
            console.log('Test user already exists');
        }
        
        process.exit();
    } catch (error) {
        console.error('Error creating test user:', error);
        process.exit(1);
    }
};

createTestUser(); 