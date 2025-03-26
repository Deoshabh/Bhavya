const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const adminAuth = require('../middleware/adminAuth');
const imageUpload = require('../utils/imageUpload');
const AnalyticsService = require('../services/AnalyticsService');
const createError = require('http-errors');
const analyticsErrorHandler = require('../middleware/analyticsErrorHandler');
const auditLogger = require('../middleware/auditLogger');
const { checkPermission } = require('../middleware/rbac');

// Public routes
router.post('/login', adminController.login);
router.get('/verify', adminAuth, adminController.verifyAdmin);

// Protected routes - all routes after this middleware require admin authentication
router.use(adminAuth);

// Dashboard routes
router.get('/dashboard', adminController.getDashboardStats);

// User Management
router.get('/users', adminController.getUsers);
router.put('/users/:userId/status', adminController.updateUserStatus);
router.delete('/users/:userId', adminController.deleteUser);

// Event Management
router.get('/events', adminController.getEvents);
router.post('/events', adminController.createEvent);
router.get('/events/:eventId', adminController.getEventDetails);
router.put('/events/:eventId', adminController.updateEvent);
router.delete('/events/:eventId', adminController.deleteEvent);
router.get('/events/:eventId/analytics', adminController.getEventAnalytics);
router.post('/events/upload-image', 
    imageUpload,
    adminController.uploadEventImage
);

// Analytics routes
router.use('/events/:eventId/analytics', analyticsErrorHandler);

router.get('/events/:eventId/analytics/report', async (req, res, next) => {
    try {
        const report = await AnalyticsService.generateEventReport(
            req.params.eventId,
            req.query
        );
        res.json(report);
    } catch (error) {
        next(error);
    }
});

router.post(
    '/events/:eventId/tickets/bulk-update',
    async (req, res, next) => {
        try {
            const result = await AnalyticsService.bulkUpdateTickets(
                req.params.eventId,
                req.body.updates,
                req.body.options
            );
            res.json(result);
        } catch (error) {
            next(createError(error));
        }
    }
);

router.get(
    '/events/:eventId/tickets/export',
    async (req, res, next) => {
        try {
            const filePath = await AnalyticsService.exportTicketData(
                req.params.eventId,
                req.query.format
            );
            res.download(filePath);
        } catch (error) {
            next(createError(error));
        }
    }
);

// Ticket Management
router.get('/tickets', adminController.getTickets);
router.put('/tickets/:ticketId/status', adminController.updateTicketStatus);
router.delete('/tickets/:ticketId', adminController.deleteTicket);
router.get('/tickets/export', adminController.exportTickets);

// Add these routes
router.get('/exhibitors', adminController.getExhibitors);
router.post('/content', adminController.manageContent);
router.put('/settings', adminController.updateSettings);
router.get('/analytics', adminController.getAnalytics);

// Export routes
router.get('/export/users', adminController.exportUsers);

// Audit logs
router.get('/audit-logs', adminController.getAuditLogs);

module.exports = router; 