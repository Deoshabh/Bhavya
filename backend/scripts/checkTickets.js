const mongoose = require('mongoose');
const Ticket = require('../models/Ticket');
require('dotenv').config();

const checkTickets = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const tickets = await Ticket.find().populate('eventId userId');
        console.log('All tickets:', JSON.stringify(tickets, null, 2));
        process.exit();
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

checkTickets(); 