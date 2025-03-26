const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
    exhibition: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Exhibition',
        required: true
    },
    ticket: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Ticket',
        required: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    quantity: {
        type: Number,
        required: true,
        min: 1
    },
    totalPrice: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'confirmed', 'cancelled'],
        default: 'pending'
    },
    paymentStatus: {
        type: String,
        enum: ['pending', 'completed', 'failed', 'refunded'],
        default: 'pending'
    },
    paymentId: String,
    bookingDate: {
        type: Date,
        default: Date.now
    },
    attendees: [{
        name: String,
        email: String,
        phone: String
    }]
}, {
    timestamps: true
});

module.exports = mongoose.model('Booking', bookingSchema); 