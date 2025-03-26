const mongoose = require('mongoose');
const { createObjectCsvWriter } = require('csv-writer');
const path = require('path');
const fs = require('fs');
const Ticket = require('../models/Ticket');
const Event = require('../models/Event');
const Booking = require('../models/Booking');

class AnalyticsService {
    static async generateEventReport(eventId, options = {}) {
        try {
            const {
                startDate,
                endDate,
                groupBy = 'day'
            } = options;

            const matchStage = {
                event: mongoose.Types.ObjectId(eventId)
            };

            if (startDate || endDate) {
                matchStage.createdAt = {};
                if (startDate) matchStage.createdAt.$gte = new Date(startDate);
                if (endDate) matchStage.createdAt.$lte = new Date(endDate);
            }

            const bookings = await Booking.aggregate([
                { $match: matchStage },
                {
                    $group: {
                        _id: {
                            $dateToString: {
                                format: groupBy === 'day' ? '%Y-%m-%d' : '%Y-%m',
                                date: '$createdAt'
                            }
                        },
                        totalBookings: { $sum: 1 },
                        revenue: { $sum: '$totalAmount' },
                        ticketsSold: { $sum: '$quantity' }
                    }
                },
                { $sort: { '_id': 1 } }
            ]);

            return {
                data: bookings,
                summary: {
                    totalBookings: bookings.reduce((sum, b) => sum + b.totalBookings, 0),
                    totalRevenue: bookings.reduce((sum, b) => sum + b.revenue, 0),
                    totalTickets: bookings.reduce((sum, b) => sum + b.ticketsSold, 0)
                }
            };
        } catch (error) {
            console.error('Error generating event report:', error);
            throw error;
        }
    }

    static async exportTicketData(eventId, format = 'csv') {
        try {
            const event = await Event.findById(eventId);
            if (!event) throw new Error('Event not found');

            const tickets = await Ticket.find({ event: eventId })
                .populate('user', 'name email')
                .populate('event', 'title');

            const outputDir = path.join(__dirname, '../exports');
            if (!fs.existsSync(outputDir)) {
                fs.mkdirSync(outputDir, { recursive: true });
            }

            const filename = `tickets-${eventId}-${Date.now()}.csv`;
            const outputPath = path.join(outputDir, filename);

            const csvWriter = createObjectCsvWriter({
                path: outputPath,
                header: [
                    { id: 'ticketId', title: 'Ticket ID' },
                    { id: 'userName', title: 'User Name' },
                    { id: 'userEmail', title: 'User Email' },
                    { id: 'eventTitle', title: 'Event Title' },
                    { id: 'status', title: 'Status' },
                    { id: 'purchaseDate', title: 'Purchase Date' }
                ]
            });

            const records = tickets.map(ticket => ({
                ticketId: ticket._id.toString(),
                userName: ticket.user?.name || 'N/A',
                userEmail: ticket.user?.email || 'N/A',
                eventTitle: ticket.event?.title || 'N/A',
                status: ticket.status,
                purchaseDate: ticket.createdAt.toISOString()
            }));

            await csvWriter.writeRecords(records);
            return outputPath;
        } catch (error) {
            console.error('Error exporting ticket data:', error);
            throw error;
        }
    }

    static async bulkUpdateTickets(eventId, updates, options = {}) {
        const session = await mongoose.startSession();
        session.startTransaction();

        try {
            const { status, reason } = updates;
            const { notifyUsers = true } = options;

            const tickets = await Ticket.find({ 
                event: eventId,
                _id: { $in: updates.ticketIds }
            }).session(session);

            for (const ticket of tickets) {
                ticket.status = status;
                if (reason) ticket.statusReason = reason;
                await ticket.save({ session });
            }

            await session.commitTransaction();
            return { success: true, updatedCount: tickets.length };
        } catch (error) {
            await session.abortTransaction();
            throw error;
        } finally {
            session.endSession();
        }
    }
}

module.exports = AnalyticsService; 