const Ticket = require('../models/Ticket');
const Event = require('../models/Event');
const User = require('../models/User');
const { createError } = require('../utils/errorHandler');
const { validateTicketUpdate } = require('../utils/validators');
const { sendTicketStatusEmail } = require('../utils/emailService');

class TicketController {
    // Get tickets for an event with advanced filtering and pagination
    static async getEventTickets(req, res, next) {
        try {
            const { eventId } = req.params;
            const { page = 1, limit = 10, search, status, type, startDate, endDate } = req.query;

            // Build query with multiple filter options
            const query = { event: eventId };

            // Add filters if provided
            if (status && status !== 'all') query.status = status;
            if (type) query.type = type;
            if (startDate || endDate) {
                query.createdAt = {};
                if (startDate) query.createdAt.$gte = new Date(startDate);
                if (endDate) query.createdAt.$lte = new Date(endDate);
            }

            // Add search functionality across multiple fields
            if (search) {
                query.$or = [
                    { 'user.name': new RegExp(search, 'i') },
                    { 'user.email': new RegExp(search, 'i') },
                    { ticketId: new RegExp(search, 'i') }
                ];
            }

            // Execute query with pagination and population
            const tickets = await Ticket.find(query)
                .populate('user', 'name email')
                .populate('event', 'title')
                .sort({ createdAt: -1 })
                .skip((page - 1) * limit)
                .limit(parseInt(limit))
                .lean();

            // Get total count for pagination
            const total = await Ticket.countDocuments(query);

            // Add additional ticket metadata
            const enrichedTickets = tickets.map(ticket => ({
                ...ticket,
                isRefundable: this.checkRefundEligibility(ticket),
                timeUntilEvent: this.getTimeUntilEvent(ticket.event.startDate)
            }));

            res.json({
                tickets: enrichedTickets,
                total,
                totalPages: Math.ceil(total / limit),
                currentPage: parseInt(page)
            });
        } catch (error) {
            next(createError(error));
        }
    }

    // Update ticket status with validation and notifications
    static async updateTicketStatus(req, res, next) {
        try {
            const { ticketId } = req.params;
            const { status, reason } = req.body;

            // Validate update request
            const validationError = validateTicketUpdate(status, reason);
            if (validationError) {
                return res.status(400).json({ message: validationError });
            }

            // Find ticket with related data
            const ticket = await Ticket.findById(ticketId)
                .populate('user')
                .populate('event');

            if (!ticket) {
                return res.status(404).json({ message: 'Ticket not found' });
            }

            // Check business rules for status update
            const canUpdate = await this.validateStatusUpdate(ticket, status);
            if (!canUpdate.allowed) {
                return res.status(400).json({ message: canUpdate.reason });
            }

            // Perform the update
            const previousStatus = ticket.status;
            ticket.status = status;
            ticket.statusHistory.push({
                status,
                reason,
                updatedBy: req.admin._id,
                timestamp: new Date()
            });

            await ticket.save();

            // Handle side effects
            await this.handleStatusUpdateEffects(ticket, previousStatus);

            // Send notification
            await sendTicketStatusEmail(ticket.user.email, {
                ticketId: ticket._id,
                eventTitle: ticket.event.title,
                newStatus: status,
                reason
            });

            res.json({
                message: 'Ticket status updated successfully',
                ticket
            });
        } catch (error) {
            next(createError(error));
        }
    }

    // Helper methods
    static async validateStatusUpdate(ticket, newStatus) {
        // Check if event has already occurred
        if (new Date(ticket.event.startDate) < new Date()) {
            return {
                allowed: false,
                reason: 'Cannot update ticket for past events'
            };
        }

        // Check status transition rules
        const allowedTransitions = {
            pending: ['confirmed', 'cancelled'],
            confirmed: ['cancelled'],
            cancelled: []
        };

        if (!allowedTransitions[ticket.status]?.includes(newStatus)) {
            return {
                allowed: false,
                reason: `Cannot transition from ${ticket.status} to ${newStatus}`
            };
        }

        return { allowed: true };
    }

    static async handleStatusUpdateEffects(ticket, previousStatus) {
        // Update event capacity if status changed to/from confirmed
        if (previousStatus !== 'confirmed' && ticket.status === 'confirmed') {
            await Event.findByIdAndUpdate(ticket.event._id, {
                $inc: { availableSeats: -1 }
            });
        } else if (previousStatus === 'confirmed' && ticket.status !== 'confirmed') {
            await Event.findByIdAndUpdate(ticket.event._id, {
                $inc: { availableSeats: 1 }
            });
        }

        // Handle refunds if cancelled
        if (ticket.status === 'cancelled' && previousStatus === 'confirmed') {
            await this.processRefund(ticket);
        }
    }

    static checkRefundEligibility(ticket) {
        const eventDate = new Date(ticket.event.startDate);
        const now = new Date();
        const hoursUntilEvent = (eventDate - now) / (1000 * 60 * 60);
        return hoursUntilEvent > 24 && ticket.status === 'confirmed';
    }

    static getTimeUntilEvent(eventDate) {
        const now = new Date();
        const diff = new Date(eventDate) - now;
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        return days > 0 ? `${days} days` : 'Event has passed';
    }

    static async processRefund(ticket) {
        // Implement refund logic here
        // This could integrate with your payment provider's API
    }

    // Get available tickets for an event
    static async getAvailableTickets(req, res) {
        try {
            const { eventId } = req.params;
            const tickets = await Ticket.find({
                event: eventId,
                status: 'available'
            });

            res.json({
                success: true,
                tickets
            });
        } catch (error) {
            console.error('Get available tickets error:', error);
            res.status(500).json({
                success: false,
                message: 'Error fetching available tickets'
            });
        }
    }

    // Book a ticket
    static async bookTicket(req, res) {
        try {
            const { eventId, quantity = 1 } = req.body;
            const userId = req.user._id;

            // Check event exists and is published
            const event = await Event.findOne({
                _id: eventId,
                status: 'published'
            });

            if (!event) {
                return res.status(404).json({
                    success: false,
                    message: 'Event not found or not available'
                });
            }

            // Check available tickets
            const availableTickets = await Ticket.countDocuments({
                event: eventId,
                status: 'available'
            });

            if (availableTickets < quantity) {
                return res.status(400).json({
                    success: false,
                    message: 'Not enough tickets available'
                });
            }

            // Book tickets
            const tickets = await Ticket.find({
                event: eventId,
                status: 'available'
            }).limit(quantity);

            await Promise.all(tickets.map(ticket => 
                Ticket.findByIdAndUpdate(ticket._id, {
                    status: 'booked',
                    user: userId,
                    bookedAt: new Date()
                })
            ));

            res.json({
                success: true,
                message: 'Tickets booked successfully',
                tickets
            });
        } catch (error) {
            console.error('Book ticket error:', error);
            res.status(500).json({
                success: false,
                message: 'Error booking ticket'
            });
        }
    }

    // Get user's tickets
    static async getMyTickets(req, res) {
        try {
            const tickets = await Ticket.find({
                user: req.user._id
            }).populate('event');

            res.json({
                success: true,
                tickets
            });
        } catch (error) {
            console.error('Get my tickets error:', error);
            res.status(500).json({
                success: false,
                message: 'Error fetching your tickets'
            });
        }
    }

    // Get ticket details
    static async getTicketDetails(req, res) {
        try {
            const ticket = await Ticket.findById(req.params.ticketId)
                .populate('event')
                .populate('user', 'name email');

            if (!ticket) {
                return res.status(404).json({
                    success: false,
                    message: 'Ticket not found'
                });
            }

            // Check if user owns ticket or is admin
            if (!req.user.isAdmin && ticket.user.toString() !== req.user._id.toString()) {
                return res.status(403).json({
                    success: false,
                    message: 'Not authorized to view this ticket'
                });
            }

            res.json({
                success: true,
                ticket
            });
        } catch (error) {
            console.error('Get ticket details error:', error);
            res.status(500).json({
                success: false,
                message: 'Error fetching ticket details'
            });
        }
    }

    // Cancel ticket
    static async cancelTicket(req, res) {
        try {
            const ticket = await Ticket.findById(req.params.ticketId);

            if (!ticket) {
                return res.status(404).json({
                    success: false,
                    message: 'Ticket not found'
                });
            }

            if (ticket.user.toString() !== req.user._id.toString()) {
                return res.status(403).json({
                    success: false,
                    message: 'Not authorized to cancel this ticket'
                });
            }

            ticket.status = 'cancelled';
            await ticket.save();

            res.json({
                success: true,
                message: 'Ticket cancelled successfully'
            });
        } catch (error) {
            console.error('Cancel ticket error:', error);
            res.status(500).json({
                success: false,
                message: 'Error cancelling ticket'
            });
        }
    }

    // Admin: Get all tickets
    static async getAllTickets(req, res) {
        try {
            const tickets = await Ticket.find()
                .populate('event')
                .populate('user', 'name email');

            res.json({
                success: true,
                tickets
            });
        } catch (error) {
            console.error('Get all tickets error:', error);
            res.status(500).json({
                success: false,
                message: 'Error fetching tickets'
            });
        }
    }

    // Admin: Create ticket
    static async createTicket(req, res) {
        try {
            const ticket = new Ticket(req.body);
            await ticket.save();

            res.status(201).json({
                success: true,
                ticket
            });
        } catch (error) {
            console.error('Create ticket error:', error);
            res.status(500).json({
                success: false,
                message: 'Error creating ticket'
            });
        }
    }

    // Admin: Update ticket
    static async updateTicket(req, res) {
        try {
            const ticket = await Ticket.findByIdAndUpdate(
                req.params.ticketId,
                req.body,
                { new: true }
            );

            if (!ticket) {
                return res.status(404).json({
                    success: false,
                    message: 'Ticket not found'
                });
            }

            res.json({
                success: true,
                ticket
            });
        } catch (error) {
            console.error('Update ticket error:', error);
            res.status(500).json({
                success: false,
                message: 'Error updating ticket'
            });
        }
    }

    // Admin: Delete ticket
    static async deleteTicket(req, res) {
        try {
            const ticket = await Ticket.findByIdAndDelete(req.params.ticketId);

            if (!ticket) {
                return res.status(404).json({
                    success: false,
                    message: 'Ticket not found'
                });
            }

            res.json({
                success: true,
                message: 'Ticket deleted successfully'
            });
        } catch (error) {
            console.error('Delete ticket error:', error);
            res.status(500).json({
                success: false,
                message: 'Error deleting ticket'
            });
        }
    }
}

module.exports = TicketController; 