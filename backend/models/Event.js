const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Title is required'],
        trim: true
    },
    description: {
        type: String,
        required: [true, 'Description is required']
    },
    startDate: {
        type: Date,
        required: [true, 'Start date is required']
    },
    endDate: {
        type: Date,
        required: [true, 'End date is required']
    },
    location: {
        type: String,
        required: [true, 'Location is required'],
        trim: true
    },
    category: {
        type: String,
        required: [true, 'Category is required'],
        enum: ['conference', 'exhibition', 'workshop', 'trade_show', 'other']
    },
    organizer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Organizer is required']
    },
    image: {
        type: String,
        default: null
    },
    status: {
        type: String,
        enum: ['draft', 'published', 'ongoing', 'completed', 'cancelled'],
        default: 'published'
    },
    capacity: {
        type: Number,
        required: [true, 'Capacity is required']
    },
    price: {
        type: Number,
        required: [true, 'Price is required']
    },
    shortDescription: {
        type: String,
        required: [true, 'Short description is required'],
        trim: true,
        maxLength: [200, 'Short description cannot be longer than 200 characters']
    },
    featured: {
        type: Boolean,
        default: false
    },
    featuredCategory: {
        type: String,
        enum: ['exhibition', 'conference', 'highlight', 'upcoming', null],
        default: null
    },
    featuredOrder: {
        type: Number,
        default: 0
    },
    tags: [{
        type: String,
        trim: true
    }],
    venue: {
        name: String,
        address: String,
        city: String,
        coordinates: {
            lat: Number,
            lng: Number
        }
    },
    ticketTypes: [{
        name: String,
        price: Number,
        quantity: Number,
        description: String
    }],
    publishedAt: {
        type: Date,
        default: null
    },
    // Exhibitor settings
    allowExhibitors: {
        type: Boolean,
        default: false
    },
    exhibitorSpaceAvailable: {
        type: Number,  // Total square meters available
        default: 0
    },
    exhibitorSpaceBooked: {
        type: Number,  // Total square meters booked
        default: 0
    },
    exhibitorPricing: {
        standard: {
            type: Number,
            default: 0  // Price per square meter
        },
        premium: {
            type: Number,
            default: 0
        },
        corner: {
            type: Number,
            default: 0
        }
    },
    exhibitorDeadline: {
        type: Date
    },
    exhibitorSetupDate: {
        type: Date
    },
    exhibitorRequirements: {
        type: String
    },
    maxExhibitors: {
        type: Number,
        default: 0
    },
    currentExhibitors: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

// Add compound index to prevent duplicate events
eventSchema.index(
    { title: 1, startDate: 1, location: 1 }, 
    { unique: true }
);

// Add index for featured events
eventSchema.index({ featured: 1, featuredCategory: 1, featuredOrder: 1 });

// Add pre-save middleware to format data
eventSchema.pre('save', function(next) {
    // Trim strings
    if (this.title) this.title = this.title.trim();
    if (this.location) this.location = this.location.trim();
    if (this.description) this.description = this.description.trim();
    
    if (this.isModified('status') && this.status === 'published' && !this.publishedAt) {
        this.publishedAt = new Date();
    }
    
    if (!this.shortDescription && this.description) {
        this.shortDescription = this.description.slice(0, 200);
    }
    
    next();
});

const Event = mongoose.model('Event', eventSchema);
module.exports = Event;