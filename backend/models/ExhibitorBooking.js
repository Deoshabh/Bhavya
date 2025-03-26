const mongoose = require('mongoose');

const exhibitorBookingSchema = new mongoose.Schema({
    eventId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Event',
        required: true
    },
    companyName: {
        type: String,
        required: true
    },
    contactPerson: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        required: true
    },
    spaceRequired: {
        type: Number,
        required: true
    },
    spaceType: {
        type: String,
        enum: ['standard', 'premium', 'corner'],
        default: 'standard'
    },
    productCategory: {
        type: String,
        required: true
    },
    specialRequirements: String,
    previousExhibitor: {
        type: Boolean,
        default: false
    },
    marketingMaterials: {
        type: Boolean,
        default: false
    },
    powerRequirement: String,
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected', 'cancelled'],
        default: 'pending'
    },
    adminNotes: String,
    paymentStatus: {
        type: String,
        enum: ['pending', 'partial', 'completed'],
        default: 'pending'
    },
    totalAmount: {
        type: Number,
        default: 0
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

exhibitorBookingSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

module.exports = mongoose.model('ExhibitorBooking', exhibitorBookingSchema); 