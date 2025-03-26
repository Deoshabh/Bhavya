const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const ticketController = require('../controllers/ticketController');
const adminAuth = require('../middleware/adminAuth');
const limiter = require('../middleware/rateLimiter');
const {
    validateTicketCreate,
    validateTicketUpdate,
    validateTicketRequest,
    handleValidationErrors
} = require('../middleware/validators');

// Apply rate limiting to all ticket routes
router.use(limiter);

// Public routes
router.get('/available/:eventId', ticketController.getAvailableTickets);

// Protected routes
router.use(auth); // Require authentication for all routes below

router.post('/book', 
    validateTicketRequest,
    handleValidationErrors,
    ticketController.bookTicket
);

router.get('/my-tickets', ticketController.getMyTickets);
router.get('/:ticketId', ticketController.getTicketDetails);
router.put('/:ticketId/cancel', ticketController.cancelTicket);

// Admin routes
router.use(adminAuth);
router.get('/admin/all', ticketController.getAllTickets);
router.post('/admin/create',
    validateTicketCreate,
    handleValidationErrors,
    ticketController.createTicket
);
router.put('/admin/:ticketId',
    validateTicketUpdate,
    handleValidationErrors,
    ticketController.updateTicket
);
router.delete('/admin/:ticketId', ticketController.deleteTicket);

module.exports = router; 