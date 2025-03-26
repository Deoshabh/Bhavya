const mongoose = require('mongoose');

const profileSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    avatar: {
        type: String,
        default: ''
    },
    bio: {
        type: String,
        trim: true
    },
    // Common fields for both types
    address: {
        street: String,
        city: String,
        state: String,
        pincode: String,
        country: String
    },
    // Visitor specific fields
    visitorProfile: {
        interests: [String],
        preferredCategories: [String],
        attendedEvents: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Event'
        }]
    },
    // Exhibitor specific fields
    exhibitorProfile: {
        companyLogo: String,
        companyDescription: String,
        website: String,
        socialMedia: {
            facebook: String,
            twitter: String,
            instagram: String,
            linkedin: String
        },
        pastEvents: [{
            title: String,
            date: Date,
            description: String,
            images: [String]
        }],
        documents: {
            businessRegistration: String,
            taxCertificates: String
        }
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Profile', profileSchema); 