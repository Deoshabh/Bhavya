const Admin = require('../models/Admin');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Event = require('../models/Event');
const Ticket = require('../models/Ticket');
const Booking = require('../models/Booking');
const mongoose = require('mongoose');
const { exportToExcel, exportToPDF } = require('../utils/exportUtils');
const AuditLog = require('../models/AuditLog');
const cloudinary = require('../config/cloudinary');

// Admin Authentication
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        console.log('Login attempt for:', email); // Debug log

        // Find admin
        const admin = await Admin.findOne({ email });
        if (!admin) {
            console.log('Admin not found'); // Debug log
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Verify password
        const isMatch = await admin.comparePassword(password);
        if (!isMatch) {
            console.log('Password mismatch'); // Debug log
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Generate token
        const token = jwt.sign(
            { id: admin._id, role: 'admin' },
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );

        console.log('Login successful'); // Debug log

        res.json({
            token,
            admin: {
                id: admin._id,
                name: admin.name,
                email: admin.email,
                role: admin.role
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get dashboard statistics
exports.getDashboardStats = async (req, res) => {
    try {
        // Get users count and recent users
        const usersCount = await User.countDocuments();
        const recentUsers = await User.find()
            .sort({ createdAt: -1 })
            .limit(5)
            .select('name email createdAt');

        // Get events count and stats
        const eventsCount = await Event.countDocuments();
        const recentEvents = await Event.find()
            .sort({ startDate: -1 })
            .limit(5)
            .select('title startDate location status');

        // Get tickets stats
        const ticketsCount = await Ticket.countDocuments();
        const ticketsSold = await Booking.countDocuments({ status: 'confirmed' });

        // Calculate revenue
        const revenue = await Booking.aggregate([
            { $match: { status: 'confirmed' } },
            { $group: { _id: null, total: { $sum: '$totalAmount' } } }
        ]);

        // Get recent activities from audit logs
        const recentActivities = await AuditLog.find()
            .sort({ timestamp: -1 })
            .limit(10)
            .populate('user', 'name email');

        res.json({
            users: {
                total: usersCount,
                recent: recentUsers,
                visitors: await User.countDocuments({ role: 'visitor' }),
                exhibitors: await User.countDocuments({ role: 'exhibitor' })
            },
            events: {
                total: eventsCount,
                recent: recentEvents,
                upcoming: await Event.countDocuments({ 
                    startDate: { $gt: new Date() } 
                })
            },
            tickets: {
                total: ticketsCount,
                sold: ticketsSold
            },
            revenue: revenue[0]?.total || 0,
            recentActivities: recentActivities.map(activity => ({
                _id: activity._id,
                type: activity.action,
                description: `${activity.user?.name || 'System'} ${activity.action} ${activity.resource}`,
                timestamp: activity.timestamp
            }))
        });
    } catch (error) {
        console.error('Dashboard stats error:', error);
        res.status(500).json({ message: 'Error fetching dashboard statistics' });
    }
};

// User Management
exports.getUsers = async (req, res) => {
    try {
        const { page = 1, limit = 10, userType, search } = req.query;
        const query = {};

        if (userType) {
            query.userType = userType;
        }

        if (search) {
            query.$or = [
                { name: new RegExp(search, 'i') },
                { email: new RegExp(search, 'i') }
            ];
        }

        const users = await User.find(query)
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .select('-password');

        const total = await User.countDocuments(query);

        res.json({
            users,
            totalPages: Math.ceil(total / limit),
            currentPage: page,
            total
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Event Management
exports.getEvents = async (req, res) => {
    try {
        const { page = 1, limit = 10, status, search } = req.query;
        const query = {};

        if (status) {
            query.status = status;
        }

        if (search) {
            query.$or = [
                { title: new RegExp(search, 'i') },
                { location: new RegExp(search, 'i') }
            ];
        }

        const events = await Event.find(query)
            .sort({ startDate: 1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const total = await Event.countDocuments(query);

        res.json({
            events,
            totalPages: Math.ceil(total / limit),
            currentPage: page,
            total
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.updateUserStatus = async (req, res) => {
    try {
        const { userId } = req.params;
        const { status } = req.body;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        user.status = status;
        await user.save();

        res.json({ message: 'User status updated successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.deleteUser = async (req, res) => {
    try {
        const { userId } = req.params;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        await user.remove();
        res.json({ message: 'User deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Create Event
exports.createEvent = async (req, res) => {
    try {
        console.log('Creating event with data:', req.body);
        
        // Remove any _id if it exists in the request body
        const { _id, ...eventData } = req.body;
        
        // Validate status
        if (!['draft', 'published', 'ongoing', 'completed', 'cancelled'].includes(eventData.status)) {
            eventData.status = 'published'; // Set default status if invalid
        }

        const event = new Event({
            ...eventData,
            organizer: req.admin._id
        });

        console.log('Event before save:', event);
        const savedEvent = await event.save();
        console.log('Event after save:', savedEvent);
        
        const populatedEvent = await Event.findById(savedEvent._id)
            .populate('organizer', 'name email');

        res.status(201).json({
            success: true,
            message: 'Event created successfully',
            event: populatedEvent
        });
    } catch (error) {
        console.error('Create event error:', error);
        
        if (error.name === 'ValidationError') {
            return res.status(400).json({
                message: 'Validation error',
                errors: Object.values(error.errors).map(err => err.message)
            });
        }
        
        if (error.code === 11000) {
            return res.status(400).json({
                message: 'Duplicate event error',
                error: 'An event with these details already exists'
            });
        }
        
        res.status(500).json({ 
            message: 'Error creating event',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Update Event
exports.updateEvent = async (req, res) => {
    try {
        const { eventId } = req.params;
        const updates = req.body;
        
        // Generate shortDescription if not provided
        if (!updates.shortDescription && updates.description) {
            updates.shortDescription = updates.description.slice(0, 200);
        }

        const event = await Event.findById(eventId);
        if (!event) {
            return res.status(404).json({ message: 'Event not found' });
        }

        Object.keys(updates).forEach(key => {
            event[key] = updates[key];
        });
        
        const updatedEvent = await event.save();
        res.json({
            success: true,
            event: updatedEvent
        });
    } catch (error) {
        console.error('Update event error:', error);
        res.status(500).json({ 
            success: false,
            message: error.name === 'ValidationError' 
                ? Object.values(error.errors).map(err => err.message).join(', ')
                : 'Error updating event'
        });
    }
};

// Delete Event
exports.deleteEvent = async (req, res) => {
    try {
        const { eventId } = req.params;
        
        // Check if event exists
        const event = await Event.findById(eventId);
        if (!event) {
            return res.status(404).json({ 
                success: false,
                message: 'Event not found' 
            });
        }

        // Check if there are any tickets sold
        const ticketsSold = await Ticket.countDocuments({ 
            event: eventId,
            status: { $in: ['booked', 'used'] }
        });

        if (ticketsSold > 0) {
            return res.status(400).json({ 
                success: false,
                message: 'Cannot delete event with sold tickets' 
            });
        }

        // Delete the event using findByIdAndDelete
        await Event.findByIdAndDelete(eventId);

        // Delete associated tickets
        await Ticket.deleteMany({ event: eventId });

        // Log the action
        await AuditLog.create({
            user: req.admin._id,
            action: 'delete',
            resource: 'event',
            details: {
                eventId,
                eventTitle: event.title
            }
        });

        res.json({ 
            success: true,
            message: 'Event deleted successfully' 
        });
    } catch (error) {
        console.error('Delete event error:', error);
        res.status(500).json({ 
            success: false,
            message: 'Error deleting event',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Get Event Details
exports.getEventDetails = async (req, res) => {
    try {
        const event = await Event.findById(req.params.eventId)
            .populate('organizer', 'name email');
        
        if (!event) {
            return res.status(404).json({ message: 'Event not found' });
        }
        
        res.json(event);
    } catch (error) {
        console.error('Get event details error:', error);
        res.status(500).json({ message: 'Error fetching event details' });
    }
};

// Get Event Analytics
exports.getEventAnalytics = async (req, res) => {
    try {
        const eventId = req.params.eventId;
        const event = await Event.findById(eventId);
        
        if (!event) {
            return res.status(404).json({ message: 'Event not found' });
        }

        // Get ticket sales data
        const ticketSales = await Ticket.aggregate([
            { $match: { event: mongoose.Types.ObjectId(eventId) } },
            { $group: {
                _id: '$status',
                count: { $sum: 1 },
                revenue: { $sum: '$price' }
            }}
        ]);

        // Get daily sales data
        const dailySales = await Ticket.aggregate([
            { $match: { event: mongoose.Types.ObjectId(eventId) } },
            { $group: {
                _id: { 
                    $dateToString: { 
                        format: '%Y-%m-%d', 
                        date: '$createdAt' 
                    }
                },
                sales: { $sum: 1 },
                revenue: { $sum: '$price' }
            }},
            { $sort: { '_id': 1 } }
        ]);

        res.json({
            ticketSales,
            dailySales,
            totalRevenue: ticketSales.reduce((acc, curr) => acc + (curr.revenue || 0), 0)
        });
    } catch (error) {
        console.error('Event analytics error:', error);
        res.status(500).json({ message: 'Error fetching event analytics' });
    }
};

// Upload Event Image
exports.uploadEventImage = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ 
                success: false,
                message: 'No image file provided' 
            });
        }

        // Debug logs
        console.log('File received:', {
            mimetype: req.file.mimetype,
            size: req.file.size
        });

        // Convert buffer to base64
        const fileStr = req.file.buffer.toString('base64');
        const fileType = req.file.mimetype;

        // Upload to Cloudinary
        const uploadResponse = await cloudinary.uploader.upload(
            `data:${fileType};base64,${fileStr}`,
            {
                folder: 'events',
                resource_type: 'auto',
                transformation: [
                    { width: 1000, height: 600, crop: 'limit' }
                ]
            }
        );

        res.json({
            success: true,
            imageUrl: uploadResponse.secure_url,
            message: 'Image uploaded successfully'
        });
    } catch (error) {
        console.error('Image upload error:', error);
        res.status(500).json({
            success: false,
            message: 'Error uploading image',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Add this function to your existing adminController.js
exports.verifyAdmin = async (req, res) => {
    try {
        // req.admin is already set by adminAuth middleware
        const admin = req.admin;
        
        res.json({
            id: admin._id,
            name: admin.name,
            email: admin.email,
            role: admin.role,
            permissions: admin.permissions
        });
    } catch (error) {
        console.error('Admin verification error:', error);
        res.status(500).json({ message: 'Error verifying admin' });
    }
};

// Add these controller functions
exports.getExhibitors = async (req, res) => {
    // Implement exhibitor listing and management
};

exports.manageContent = async (req, res) => {
    // Implement content management
};

exports.updateSettings = async (req, res) => {
    // Implement settings management
};

exports.getAnalytics = async (req, res) => {
    // Implement detailed analytics
};

// Export Users
exports.exportUsers = async (req, res) => {
    try {
        const users = await User.find().select('-password');
        const { format = 'excel' } = req.query;

        const headers = [
            { key: 'name', label: 'Name' },
            { key: 'email', label: 'Email' },
            { key: 'createdAt', label: 'Join Date' }
        ];

        if (format === 'excel') {
            const workbook = await exportToExcel(users, headers);
            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            res.setHeader('Content-Disposition', 'attachment; filename=users.xlsx');
            await workbook.xlsx.write(res);
            res.end();
        } else if (format === 'pdf') {
            const doc = await exportToPDF(users, headers);
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', 'attachment; filename=users.pdf');
            doc.pipe(res);
            doc.end();
        } else {
            res.status(400).json({ message: 'Unsupported export format' });
        }
    } catch (error) {
        console.error('Export users error:', error);
        res.status(500).json({ message: 'Error exporting users' });
    }
};

// Get Audit Logs
exports.getAuditLogs = async (req, res) => {
    try {
        const { page = 1, limit = 20, action, resource } = req.query;
        const query = {};

        if (action) query.action = action;
        if (resource) query.resource = resource;

        const logs = await AuditLog.find(query)
            .sort({ timestamp: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .populate('user', 'name email');

        const total = await AuditLog.countDocuments(query);

        res.json({
            logs,
            totalPages: Math.ceil(total / limit),
            currentPage: page,
            total
        });
    } catch (error) {
        console.error('Get audit logs error:', error);
        res.status(500).json({ message: 'Error fetching audit logs' });
    }
};

// Get all tickets
exports.getTickets = async (req, res) => {
    try {
        const { page = 1, limit = 10, status, eventId, search } = req.query;
        const query = {};

        // Add filters
        if (status) query.status = status;
        if (eventId) query.event = eventId;
        if (search) {
            query.$or = [
                { 'user.name': new RegExp(search, 'i') },
                { 'event.title': new RegExp(search, 'i') },
                { ticketId: new RegExp(search, 'i') }
            ];
        }

        const tickets = await Ticket.find(query)
            .populate('user', 'name email')
            .populate('event', 'title startDate location')
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const total = await Ticket.countDocuments(query);

        res.json({
            success: true,
            tickets,
            totalPages: Math.ceil(total / limit),
            currentPage: page,
            total
        });
    } catch (error) {
        console.error('Get tickets error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching tickets',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Update ticket status
exports.updateTicketStatus = async (req, res) => {
    try {
        const { ticketId } = req.params;
        const { status } = req.body;

        const ticket = await Ticket.findById(ticketId);
        if (!ticket) {
            return res.status(404).json({
                success: false,
                message: 'Ticket not found'
            });
        }

        ticket.status = status;
        await ticket.save();

        // Log the action
        await AuditLog.create({
            user: req.admin._id,
            action: 'update',
            resource: 'ticket',
            details: {
                ticketId,
                newStatus: status
            }
        });

        res.json({
            success: true,
            message: 'Ticket status updated successfully',
            ticket
        });
    } catch (error) {
        console.error('Update ticket error:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating ticket status',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Delete ticket
exports.deleteTicket = async (req, res) => {
    try {
        const { ticketId } = req.params;

        const ticket = await Ticket.findById(ticketId);
        if (!ticket) {
            return res.status(404).json({
                success: false,
                message: 'Ticket not found'
            });
        }

        if (ticket.status === 'used' || ticket.status === 'booked') {
            return res.status(400).json({
                success: false,
                message: 'Cannot delete used or booked tickets'
            });
        }

        await ticket.deleteOne();

        // Log the action
        await AuditLog.create({
            user: req.admin._id,
            action: 'delete',
            resource: 'ticket',
            details: { ticketId }
        });

        res.json({
            success: true,
            message: 'Ticket deleted successfully'
        });
    } catch (error) {
        console.error('Delete ticket error:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting ticket',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Export tickets
exports.exportTickets = async (req, res) => {
    try {
        const { format = 'excel', eventId } = req.query;
        const query = eventId ? { event: eventId } : {};

        const tickets = await Ticket.find(query)
            .populate('user', 'name email')
            .populate('event', 'title startDate');

        const headers = [
            { key: 'ticketId', label: 'Ticket ID' },
            { key: 'event.title', label: 'Event' },
            { key: 'user.name', label: 'User' },
            { key: 'status', label: 'Status' },
            { key: 'price', label: 'Price' },
            { key: 'createdAt', label: 'Purchase Date' }
        ];

        if (format === 'excel') {
            const workbook = await exportToExcel(tickets, headers);
            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            res.setHeader('Content-Disposition', 'attachment; filename=tickets.xlsx');
            await workbook.xlsx.write(res);
            res.end();
        } else if (format === 'pdf') {
            const doc = await exportToPDF(tickets, headers);
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', 'attachment; filename=tickets.pdf');
            doc.pipe(res);
            doc.end();
        } else {
            res.status(400).json({
                success: false,
                message: 'Unsupported export format'
            });
        }
    } catch (error) {
        console.error('Export tickets error:', error);
        res.status(500).json({
            success: false,
            message: 'Error exporting tickets',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
}; 