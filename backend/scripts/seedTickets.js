const mongoose = require('mongoose');
const Ticket = require('../models/Ticket');
const Exhibition = require('../models/Exhibition');
const User = require('../models/User');
require('dotenv').config();

const sampleTickets = [
    {
        title: 'Early Bird Pass',
        description: 'Get exclusive early access to the Digital India Expo with special pricing. Includes welcome kit and priority access to keynote sessions.',
        price: 3999,
        availableQuantity: 100,
        category: 'early_bird',
        validFrom: new Date('2024-02-01'),
        validUntil: new Date('2024-03-15'),
        features: [
            'Priority Entry',
            'Welcome Kit',
            'Reserved Seating for Keynotes',
            'Exclusive Networking Session'
        ]
    },
    {
        title: 'Regular Pass',
        description: 'Standard entry ticket to Digital India Expo. Access to all exhibition areas, workshops, and general sessions.',
        price: 6499,
        availableQuantity: 500,
        category: 'regular',
        validFrom: new Date('2024-02-01'),
        validUntil: new Date('2024-04-15'),
        features: [
            'General Entry',
            'Access to All Exhibition Areas',
            'Workshop Participation',
            'Digital Event Guide'
        ]
    },
    {
        title: 'VIP Pass',
        description: 'Premium access with exclusive benefits including VIP lounge access, dedicated concierge, and private networking events.',
        price: 12999,
        availableQuantity: 50,
        category: 'vip',
        validFrom: new Date('2024-02-01'),
        validUntil: new Date('2024-04-15'),
        features: [
            'VIP Entry',
            'Exclusive Lounge Access',
            'Dedicated Concierge',
            'Private Networking Events',
            'Premium Refreshments',
            'VIP Parking'
        ]
    },
    {
        title: 'Student Pass',
        description: 'Special discounted pass for students. Valid student ID required at entry.',
        price: 1999,
        availableQuantity: 200,
        category: 'regular',
        validFrom: new Date('2024-02-01'),
        validUntil: new Date('2024-04-15'),
        features: [
            'General Entry',
            'Student Workshops',
            'Career Fair Access',
            'Digital Certificate'
        ]
    },
    {
        title: 'Group Pass (5+ People)',
        description: 'Special rate for corporate and group bookings. Minimum 5 tickets per booking.',
        price: 4999,
        availableQuantity: 100,
        category: 'group',
        validFrom: new Date('2024-02-01'),
        validUntil: new Date('2024-04-15'),
        features: [
            'Group Check-in',
            'Dedicated Guide',
            'Group Workshop Sessions',
            'Team Photo Session'
        ]
    }
];

const seedTickets = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        // Clear existing tickets
        await Ticket.deleteMany({});
        console.log('Cleared existing tickets');

        // Get or create a sample exhibition
        let exhibition = await Exhibition.findOne({ title: 'Digital India Expo 2024' });
        
        if (!exhibition) {
            // Get or create an exhibitor
            let exhibitor = await User.findOne({ email: 'exhibitor@test.com' });
            
            if (!exhibitor) {
                exhibitor = await User.create({
                    name: 'Test Exhibitor',
                    email: 'exhibitor@test.com',
                    password: 'password123',
                    role: 'exhibitor'
                });
                console.log('Created test exhibitor');
            }

            exhibition = await Exhibition.create({
                title: 'Digital India Expo 2024',
                description: 'The largest technology exhibition showcasing Digital India initiatives and innovations.',
                startDate: new Date('2024-04-15'),
                endDate: new Date('2024-04-20'),
                location: {
                    name: 'Pragati Maidan',
                    address: 'Mathura Road',
                    city: 'New Delhi',
                    coordinates: {
                        lat: 28.6129,
                        lng: 77.2295
                    }
                },
                category: 'technology',
                image: 'https://example.com/expo-image.jpg',
                organizer: exhibitor._id,
                status: 'upcoming',
                featured: true
            });
            console.log('Created sample exhibition');
        }

        // Add exhibition reference to tickets and create them
        const ticketsWithExhibition = sampleTickets.map(ticket => ({
            ...ticket,
            exhibition: exhibition._id,
            status: 'active'
        }));

        const createdTickets = await Ticket.insertMany(ticketsWithExhibition);
        console.log(`Created ${createdTickets.length} sample tickets`);

        await mongoose.connection.close();
        console.log('Database connection closed');
    } catch (error) {
        console.error('Error seeding tickets:', error);
        await mongoose.connection.close();
        process.exit(1);
    }
};

seedTickets(); 