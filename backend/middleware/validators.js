const { body, param, query, validationResult } = require('express-validator');

// Validate ticket creation
const validateTicketCreate = [
    body('title').trim().notEmpty().withMessage('Title is required'),
    body('description').trim().notEmpty().withMessage('Description is required'),
    body('price').isNumeric().withMessage('Price must be a number'),
    body('date').isISO8601().withMessage('Invalid date format'),
    body('location').notEmpty().withMessage('Location is required'),
    body('category').notEmpty().withMessage('Category is required'),
];

// Validate ticket update
const validateTicketUpdate = [
    param('ticketId').isMongoId().withMessage('Invalid ticket ID'),
    body('status')
        .optional()
        .isIn(['pending', 'confirmed', 'cancelled'])
        .withMessage('Invalid status'),
    body('reason')
        .if(body('status').equals('cancelled'))
        .notEmpty()
        .withMessage('Reason is required when cancelling'),
];

// Validate ticket request
const validateTicketRequest = [
    param('ticketId').isMongoId().withMessage('Invalid ticket ID'),
    body('status')
        .isIn(['pending', 'confirmed', 'cancelled'])
        .withMessage('Invalid status'),
    body('reason')
        .optional()
        .isString()
        .isLength({ min: 5, max: 200 })
        .withMessage('Reason must be between 5 and 200 characters'),
];

// Middleware to check for validation errors
const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ 
            message: 'Validation failed',
            errors: errors.array() 
        });
    }
    next();
};

module.exports = {
    validateTicketCreate,
    validateTicketUpdate,
    validateTicketRequest,
    handleValidationErrors
}; 