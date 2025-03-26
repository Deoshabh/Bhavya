const mongoose = require('mongoose');
const Event = require('../models/Event');
const User = require('../models/User');
const Ticket = require('../models/Ticket');
require('dotenv').config();

const generateTicketNumber = () => {
    return 'TKT' + Math.random().toString(36).substr(2, 9).toUpperCase();
};

const seedData = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        
        // Create sample events if none exist
        const existingEvents = await Event.find();
        if (existingEvents.length === 0) {
            const sampleEvents = [
                {
                    name: 'Tech Conference 2024',
                    description: 'Annual technology conference',
                    date: new Date('2024-06-15'),
                    venue: 'Convention Center',
                    imageUrl: 'https://example.com/tech-conf.jpg',
                    price: 99.99
                },
                {
                    name: 'Art Exhibition',
                    description: 'Modern art showcase',
                    date: new Date('2024-07-20'),
                    venue: 'City Gallery',
                    imageUrl: 'https://example.com/art-exhibit.jpg',
                    price: 49.99
                },
                {
                    name: 'Music Festival',
                    description: 'Summer music festival',
                    date: new Date('2024-08-10'),
                    venue: 'Central Park',
                    imageUrl: 'https://example.com/music-fest.jpg',
                    price: 149.99
                }
            ];

            const events = await Event.insertMany(sampleEvents);
            console.log('Sample events created!');

            // Get or create a user
            let user = await User.findOne();
            if (!user) {
                user = await User.create({
                    name: 'Test User',
                    email: 'test@example.com',
                    password: 'password123'
                });
                console.log('Test user created!');
            }

            // Create tickets for each event
            const tickets = events.map(event => ({
                eventId: event._id,
                userId: user._id,
                ticketNumber: generateTicketNumber(),
                status: 'valid',
                purchaseDate: new Date(),
                seatNumber: `A${Math.floor(Math.random() * 100)}`,
                price: event.price,
                qrCode: `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${generateTicketNumber()}`
            }));

            await Ticket.insertMany(tickets);
            console.log('Sample tickets created!');
        } else {
            console.log('Events already exist, skipping seed');
        }

        process.exit();
    } catch (error) {
        console.error('Error seeding data:', error);
        process.exit(1);
    }
};

seedData(); 