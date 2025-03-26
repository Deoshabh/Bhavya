const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: {
        status: 429,
        message: 'Too many requests, please try again later.'
    },
    // Added configuration to properly identify client IPs behind a proxy
    standardHeaders: true,
    legacyHeaders: false,
    trustProxy: true // Explicitly trust the proxy
});

module.exports = limiter;