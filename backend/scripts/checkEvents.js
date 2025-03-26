const mongoose = require('mongoose');
const Event = require('../models/Event');
require('dotenv').config();

const checkEvents = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const events = await Event.find();
        console.log('All events:', JSON.stringify(events, null, 2));
        process.exit();
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

checkEvents(); 