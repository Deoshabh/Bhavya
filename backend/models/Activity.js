const mongoose = require('mongoose');

// For tracking activities
const activitySchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    action: {
        type: String,
        required: true,
        enum: ['create', 'update', 'delete', 'view', 'login', 'logout']
    },
    resource: {
        type: String,
        required: true
    },
    details: mongoose.Schema.Types.Mixed,
    timestamp: {
        type: Date,
        default: Date.now
    }
});

const Activity = mongoose.model('Activity', activitySchema);
module.exports = Activity; 