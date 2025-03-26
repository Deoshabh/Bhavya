const analyticsErrorHandler = (err, req, res, next) => {
    console.error('Analytics Error:', err);
    
    if (err.code === 'ENOENT') {
        return res.status(404).json({
            message: 'Export file not found'
        });
    }

    if (err.name === 'ValidationError') {
        return res.status(400).json({
            message: 'Invalid data provided for analytics',
            errors: Object.values(err.errors).map(e => e.message)
        });
    }

    res.status(500).json({
        message: 'Error processing analytics request',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
};

module.exports = analyticsErrorHandler; 