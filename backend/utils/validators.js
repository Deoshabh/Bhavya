const { AppError } = require('./errorHandler');

// Validate ticket update request
const validateTicketUpdate = (status, reason) => {
    // Validate status
    const validStatuses = ['pending', 'confirmed', 'cancelled'];
    if (!validStatuses.includes(status)) {
        return 'Invalid ticket status';
    }

    // Validate reason if status is cancelled
    if (status === 'cancelled' && (!reason || reason.length < 5)) {
        return 'Cancellation reason is required (minimum 5 characters)';
    }

    return null;
};

// Validate ticket creation request
const validateTicketCreate = (ticketData) => {
    const requiredFields = ['title', 'description', 'price', 'date', 'location', 'category'];
    
    for (const field of requiredFields) {
        if (!ticketData[field]) {
            return `${field} is required`;
        }
    }

    if (ticketData.price < 0) {
        return 'Price cannot be negative';
    }

    if (new Date(ticketData.date) < new Date()) {
        return 'Event date cannot be in the past';
    }

    return null;
};

// Validate event request
const validateEventRequest = (eventData) => {
    const requiredFields = ['title', 'description', 'startDate', 'endDate', 'location', 'category'];
    
    for (const field of requiredFields) {
        if (!eventData[field]) {
            return `${field} is required`;
        }
    }

    const startDate = new Date(eventData.startDate);
    const endDate = new Date(eventData.endDate);

    if (startDate >= endDate) {
        return 'End date must be after start date';
    }

    return null;
};

// Validate booking request
const validateBookingRequest = (bookingData) => {
    const requiredFields = ['exhibition', 'ticket', 'quantity'];
    
    for (const field of requiredFields) {
        if (!bookingData[field]) {
            return `${field} is required`;
        }
    }

    if (bookingData.quantity < 1) {
        return 'Quantity must be at least 1';
    }

    if (bookingData.attendees) {
        for (const attendee of bookingData.attendees) {
            if (!attendee.name || !attendee.email) {
                return 'All attendees must have name and email';
            }
        }
    }

    return null;
};

// Validate user update request
const validateUserUpdate = (userData) => {
    if (userData.email && !isValidEmail(userData.email)) {
        return 'Invalid email format';
    }

    if (userData.mobile && !isValidMobile(userData.mobile)) {
        return 'Invalid mobile number format';
    }

    return null;
};

// Helper functions
const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

const isValidMobile = (mobile) => {
    const mobileRegex = /^[0-9]{10}$/;
    return mobileRegex.test(mobile);
};

module.exports = {
    validateTicketUpdate,
    validateTicketCreate,
    validateEventRequest,
    validateBookingRequest,
    validateUserUpdate
}; 