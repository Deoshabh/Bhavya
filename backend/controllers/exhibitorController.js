const ExhibitorBooking = require('../models/ExhibitorBooking');
const Event = require('../models/Event');
const { sendEmail } = require('../utils/email');

// Create exhibitor booking
exports.createExhibitorBooking = async (req, res) => {
    try {
        const { eventId } = req.params;
        
        // Check if event exists and is open for exhibitors
        const event = await Event.findById(eventId);
        if (!event) {
            return res.status(404).json({
                success: false,
                message: 'Event not found'
            });
        }

        if (!event.allowExhibitors) {
            return res.status(400).json({
                success: false,
                message: 'This event is not open for exhibitor bookings'
            });
        }

        // Create booking
        const booking = new ExhibitorBooking({
            ...req.body,
            eventId,
            status: 'pending',
            paymentStatus: 'pending'
        });

        await booking.save();

        // Send confirmation email to exhibitor
        try {
            await sendEmail({
                to: booking.email,
                subject: 'Exhibitor Booking Request Received',
                template: 'exhibitor-booking-confirmation',
                data: {
                    companyName: booking.companyName,
                    eventName: event.title,
                    bookingId: booking._id,
                    contactPerson: booking.contactPerson
                }
            });
        } catch (emailError) {
            console.error('Failed to send confirmation email:', emailError);
        }

        // Send notification to admin
        try {
            await sendEmail({
                to: process.env.ADMIN_EMAIL,
                subject: 'New Exhibitor Booking Request',
                template: 'admin-exhibitor-notification',
                data: {
                    companyName: booking.companyName,
                    eventName: event.title,
                    bookingId: booking._id,
                    spaceRequired: booking.spaceRequired,
                    spaceType: booking.spaceType
                }
            });
        } catch (emailError) {
            console.error('Failed to send admin notification:', emailError);
        }

        res.status(201).json({
            success: true,
            message: 'Exhibitor booking request submitted successfully',
            booking: {
                id: booking._id,
                status: booking.status,
                companyName: booking.companyName,
                eventName: event.title
            }
        });

    } catch (error) {
        console.error('Create exhibitor booking error:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating exhibitor booking',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Get exhibitor booking by ID
exports.getExhibitorBooking = async (req, res) => {
    try {
        const booking = await ExhibitorBooking.findById(req.params.id)
            .populate('eventId', 'title startDate endDate');

        if (!booking) {
            return res.status(404).json({
                success: false,
                message: 'Booking not found'
            });
        }

        res.json({
            success: true,
            booking
        });

    } catch (error) {
        console.error('Get exhibitor booking error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching exhibitor booking',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Update exhibitor booking status (admin only)
exports.updateExhibitorBookingStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, adminNotes } = req.body;

        const booking = await ExhibitorBooking.findById(id);
        if (!booking) {
            return res.status(404).json({
                success: false,
                message: 'Booking not found'
            });
        }

        booking.status = status;
        if (adminNotes) booking.adminNotes = adminNotes;
        await booking.save();

        // Send status update email to exhibitor
        try {
            await sendEmail({
                to: booking.email,
                subject: `Exhibitor Booking Status Update - ${status.toUpperCase()}`,
                template: 'exhibitor-booking-status-update',
                data: {
                    companyName: booking.companyName,
                    status,
                    adminNotes,
                    bookingId: booking._id
                }
            });
        } catch (emailError) {
            console.error('Failed to send status update email:', emailError);
        }

        res.json({
            success: true,
            message: 'Booking status updated successfully',
            booking: {
                id: booking._id,
                status: booking.status,
                adminNotes: booking.adminNotes
            }
        });

    } catch (error) {
        console.error('Update exhibitor booking status error:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating exhibitor booking status',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Get all exhibitor bookings for an event (admin only)
exports.getEventExhibitorBookings = async (req, res) => {
    try {
        const { eventId } = req.params;
        const { status } = req.query;

        const query = { eventId };
        if (status) query.status = status;

        const bookings = await ExhibitorBooking.find(query)
            .sort('-createdAt');

        res.json({
            success: true,
            bookings
        });

    } catch (error) {
        console.error('Get event exhibitor bookings error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching exhibitor bookings',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
}; 