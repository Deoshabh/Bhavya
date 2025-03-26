const router = require('express').Router();
const auth = require('../middleware/auth');
const Exhibition = require('../models/Exhibition');
const Booking = require('../models/Booking');

// Get exhibition analytics
router.get('/exhibitions/:id', auth, async (req, res) => {
    try {
        const exhibition = await Exhibition.findById(req.params.id);
        
        if (!exhibition) {
            return res.status(404).json({ message: 'Exhibition not found' });
        }

        if (exhibition.organizer.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized' });
        }

        // Get bookings analytics
        const bookings = await Booking.find({ exhibition: exhibition._id });
        
        const analytics = {
            totalBookings: bookings.length,
            revenue: bookings.reduce((sum, booking) => sum + booking.amount, 0),
            ticketsSold: bookings.reduce((sum, booking) => sum + booking.quantity, 0),
            ticketTypes: {},
            dailyBookings: {},
            occupancyRate: (exhibition.registeredCount / exhibition.capacity) * 100
        };

        // Analyze ticket types
        bookings.forEach(booking => {
            if (!analytics.ticketTypes[booking.ticketType]) {
                analytics.ticketTypes[booking.ticketType] = 0;
            }
            analytics.ticketTypes[booking.ticketType] += booking.quantity;
        });

        // Daily booking trends
        bookings.forEach(booking => {
            const date = booking.createdAt.toISOString().split('T')[0];
            if (!analytics.dailyBookings[date]) {
                analytics.dailyBookings[date] = 0;
            }
            analytics.dailyBookings[date] += booking.quantity;
        });

        res.json(analytics);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get organizer dashboard analytics
router.get('/dashboard', auth, async (req, res) => {
    try {
        if (req.user.role !== 'organizer' && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized' });
        }

        const now = new Date();
        const thirtyDaysAgo = new Date(now - 30 * 24 * 60 * 60 * 1000);

        const exhibitions = await Exhibition.find({ 
            organizer: req.user._id,
            'date.start': { $gte: thirtyDaysAgo }
        });

        const exhibitionIds = exhibitions.map(ex => ex._id);
        const bookings = await Booking.find({
            exhibition: { $in: exhibitionIds },
            createdAt: { $gte: thirtyDaysAgo }
        });

        const analytics = {
            totalExhibitions: exhibitions.length,
            activeExhibitions: exhibitions.filter(ex => 
                ex.date.start <= now && ex.date.end >= now
            ).length,
            totalRevenue: bookings.reduce((sum, booking) => sum + booking.amount, 0),
            totalAttendees: bookings.reduce((sum, booking) => sum + booking.quantity, 0),
            upcomingExhibitions: exhibitions.filter(ex => ex.date.start > now).length,
            recentBookings: await Booking.find({ exhibition: { $in: exhibitionIds } })
                .sort({ createdAt: -1 })
                .limit(5)
                .populate('exhibition', 'title')
        };

        res.json(analytics);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router; 