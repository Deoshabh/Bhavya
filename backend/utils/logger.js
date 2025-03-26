const winston = require('winston');
const DailyRotateFile = require('winston-daily-rotate-file');
const path = require('path');

// Define log directory
const logDir = path.join(__dirname, '../logs');

// Define log format
const logFormat = winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    winston.format.splat(),
    winston.format.json()
);

// Create logger instance
const logger = winston.createLogger({
    level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
    format: logFormat,
    defaultMeta: { service: 'event-platform' },
    transports: [
        // Daily rotate file for all logs
        new DailyRotateFile({
            filename: path.join(logDir, 'application-%DATE%.log'),
            datePattern: 'YYYY-MM-DD',
            zippedArchive: true,
            maxSize: '20m',
            maxFiles: '14d',
            level: 'info'
        }),
        // Separate file for error logs
        new DailyRotateFile({
            filename: path.join(logDir, 'error-%DATE%.log'),
            datePattern: 'YYYY-MM-DD',
            zippedArchive: true,
            maxSize: '20m',
            maxFiles: '30d',
            level: 'error'
        })
    ]
});

// Add console transport for non-production environments
if (process.env.NODE_ENV !== 'production') {
    logger.add(new winston.transports.Console({
        format: winston.format.combine(
            winston.format.colorize(),
            winston.format.simple()
        )
    }));
}

// Create a stream object for Morgan
logger.stream = {
    write: (message) => logger.info(message.trim())
};

// Add custom logging methods
logger.logAPIRequest = (req, duration) => {
    logger.info('API Request', {
        method: req.method,
        url: req.originalUrl,
        duration: `${duration}ms`,
        ip: req.ip,
        userId: req.user?.id || 'anonymous'
    });
};

logger.logAPIError = (error, req) => {
    logger.error('API Error', {
        error: {
            message: error.message,
            stack: error.stack
        },
        method: req.method,
        url: req.originalUrl,
        ip: req.ip,
        userId: req.user?.id || 'anonymous',
        body: req.body
    });
};

logger.logEmailError = (error, emailData) => {
    logger.error('Email Error', {
        error: {
            message: error.message,
            stack: error.stack
        },
        emailData
    });
};

logger.logDatabaseError = (error, operation) => {
    logger.error('Database Error', {
        error: {
            message: error.message,
            stack: error.stack
        },
        operation
    });
};

// Export logger instance
module.exports = logger; 