const mongoose = require('mongoose');
const Event = require('../models/Event');

// Get all events (public)
exports.getEvents = async (req, res) => {
    try {
        const { 
            page = 1, 
            limit = 9,
            category,
            search,
            sort = 'startDate'
        } = req.query;

        // Build query
        const query = {
            status: 'published', // Only show published events
            startDate: { $gte: new Date() } // Only show upcoming events
        };

        // Debug logs
        console.log('Request Query:', req.query);
        console.log('Current Date:', new Date());
        console.log('Initial Query:', query);

        // Add category filter if provided
        if (category && category !== 'all') {
            query.category = category;
        }

        // Add search filter if provided
        if (search) {
            query.$or = [
                { title: new RegExp(search, 'i') },
                { description: new RegExp(search, 'i') },
                { location: new RegExp(search, 'i') }
            ];
        }

        // Build sort object
        const sortObj = {};
        switch (sort) {
            case 'price':
                sortObj.price = 1;
                break;
            case 'price-desc':
                sortObj.price = -1;
                break;
            case 'startDate':
            default:
                sortObj.startDate = 1;
        }

        console.log('Final Query:', query);
        console.log('Sort Object:', sortObj);

        // First, find all events without pagination to check
        const allEvents = await Event.find(query);
        console.log('Total matching events (before pagination):', allEvents.length);
        console.log('Event statuses:', allEvents.map(e => ({ 
            title: e.title,
            status: e.status,
            startDate: e.startDate
        })));

        const events = await Event.find(query)
            .sort(sortObj)
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .populate('organizer', 'name');

        console.log('Events after pagination:', events.length);
        
        const total = await Event.countDocuments(query);

        const response = {
            success: true,
            events,
            totalPages: Math.ceil(total / limit),
            currentPage: page,
            total
        };

        console.log('Response:', {
            totalEvents: events.length,
            totalPages: Math.ceil(total / limit),
            currentPage: page,
            total
        });

        res.json(response);
    } catch (error) {
        console.error('Get events error:', error);
        res.status(500).json({ 
            success: false,
            message: 'Error fetching events',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Get single event by ID
exports.getEventById = async (req, res) => {
    try {
        const { id } = req.params;

        // Validate if id is a valid ObjectId
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid event ID format'
            });
        }

        const event = await Event.findById(id)
            .populate('organizer', 'name email');

        if (!event) {
            return res.status(404).json({
                success: false,
                message: 'Event not found'
            });
        }

        res.json({
            success: true,
            event
        });
    } catch (error) {
        console.error('Get event error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching event details',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Get featured events
exports.getFeaturedEvents = async (req, res) => {
    try {
        // Get featured events by category
        const [exhibitions, conferences, highlights, upcoming] = await Promise.all([
            Event.find({ 
                featured: true, 
                featuredCategory: 'exhibition',
                status: 'published',
                startDate: { $gte: new Date() }
            })
            .sort({ featuredOrder: 1 })
            .limit(4)
            .populate('organizer', 'name email'),

            Event.find({ 
                featured: true, 
                featuredCategory: 'conference',
                status: 'published',
                startDate: { $gte: new Date() }
            })
            .sort({ featuredOrder: 1 })
            .limit(4)
            .populate('organizer', 'name email'),

            Event.find({ 
                featured: true, 
                featuredCategory: 'highlight',
                status: 'published',
                startDate: { $gte: new Date() }
            })
            .sort({ featuredOrder: 1 })
            .limit(6)
            .populate('organizer', 'name email'),

            Event.find({ 
                status: 'published',
                startDate: { $gte: new Date() }
            })
            .sort({ startDate: 1 })
            .limit(4)
            .populate('organizer', 'name email')
        ]);

        // If there are no featured events, provide some default content
        res.json({
            success: true,
            featured: {
                exhibitions: exhibitions.length > 0 ? exhibitions : [],
                conferences: conferences.length > 0 ? conferences : [],
                highlights: highlights.length > 0 ? highlights : [],
                upcoming: upcoming.length > 0 ? upcoming : []
            }
        });
    } catch (error) {
        console.error('Get featured events error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching featured events',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Book an event
exports.bookEvent = async (req, res) => {
    try {
        const { eventId } = req.params;
        const userId = req.user._id;

        // Validate if event exists and is available
        const event = await Event.findOne({
            _id: eventId,
            status: 'published',
            startDate: { $gt: new Date() }
        });

        if (!event) {
            return res.status(404).json({
                success: false,
                message: 'Event not found or not available for booking'
            });
        }

        // Check if there's capacity available
        if (event.capacity <= 0) {
            return res.status(400).json({
                success: false,
                message: 'Event is fully booked'
            });
        }

        // Create a booking (you'll need to implement this based on your booking model)
        // This is a placeholder response
        res.json({
            success: true,
            message: 'Event booked successfully',
            bookingDetails: {
                event: event._id,
                user: userId,
                status: 'pending'
            }
        });
    } catch (error) {
        console.error('Book event error:', error);
        res.status(500).json({
            success: false,
            message: 'Error booking event',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};