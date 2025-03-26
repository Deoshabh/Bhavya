const express = require('express');
const router = express.Router();
const eventController = require('../controllers/eventController');
const exhibitorController = require('../controllers/exhibitorController');
const auth = require('../middleware/auth');
const adminAuth = require('../middleware/adminAuth');

// Public routes
router.get('/', eventController.getEvents);
router.get('/featured', eventController.getFeaturedEvents);
router.get('/:id', eventController.getEventById);

// Protected routes
router.use(auth);
router.post('/:eventId/book', eventController.bookEvent);

// Exhibitor routes
router.post('/:eventId/exhibitor-booking', exhibitorController.createExhibitorBooking);
router.get('/:eventId/exhibitor-booking/:id', exhibitorController.getExhibitorBooking);

// Admin only routes
router.use(adminAuth);
router.get('/:eventId/exhibitor-bookings', exhibitorController.getEventExhibitorBookings);
router.put('/exhibitor-booking/:id/status', exhibitorController.updateExhibitorBookingStatus);

module.exports = router; 