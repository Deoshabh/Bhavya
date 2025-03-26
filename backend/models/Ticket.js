const mongoose = require('mongoose');

const ticketSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true,
        min: 0
    },
    date: {
        type: Date,
        required: true
    },
    location: {
        type: String,
        required: true
    },
    category: {
        type: String,
        required: true,
        enum: ['Art', 'Cultural', 'Educational', 'Other']
    },
    availableQuantity: {
        type: Number,
        required: true,
        min: 0
    },
    image: {
        type: String,
        default: 'https://via.placeholder.com/400x300'
    }
}, {
    timestamps: true
});

// Add index for searching
ticketSchema.index({ title: 'text', description: 'text' });

// Virtual for checking if ticket is available
ticketSchema.virtual('isAvailable').get(function() {
    const now = new Date();
    return this.status === 'active' && 
           this.availableQuantity > 0 && 
           now >= this.validFrom && 
           now <= this.validUntil;
});

module.exports = mongoose.model('Ticket', ticketSchema); 