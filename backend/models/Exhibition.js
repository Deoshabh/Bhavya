const mongoose = require('mongoose');

const exhibitionSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    startDate: {
        type: Date,
        required: true
    },
    endDate: {
        type: Date,
        required: true
    },
    location: {
        name: String,
        address: String,
        city: String,
        coordinates: {
            lat: Number,
            lng: Number
        }
    },
    category: {
        type: String,
        enum: ['art', 'technology', 'business', 'cultural', 'educational'],
        required: true
    },
    image: {
        type: String,
        required: true
    },
    ticketTypes: [{
        name: String,
        description: String,
        price: Number,
        availableQuantity: Number,
        validUntil: Date
    }],
    organizer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    status: {
        type: String,
        enum: ['upcoming', 'ongoing', 'completed', 'cancelled'],
        default: 'upcoming'
    },
    featured: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

// Virtual for checking if exhibition is sold out
exhibitionSchema.virtual('isSoldOut').get(function() {
    return this.registeredCount >= this.capacity;
});

// Virtual for checking if exhibition is ongoing
exhibitionSchema.virtual('isOngoing').get(function() {
    const now = new Date();
    return now >= this.date.start && now <= this.date.end;
});

// Index for searching
exhibitionSchema.index({ title: 'text', description: 'text', 'location.city': 'text' });

module.exports = mongoose.model('Exhibition', exhibitionSchema); 