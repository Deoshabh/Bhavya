class AppError extends Error {
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;
        this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
        this.isOperational = true;

        Error.captureStackTrace(this, this.constructor);
    }
}

const createError = (error) => {
    if (error instanceof AppError) return error;
    
    // Handle mongoose validation errors
    if (error.name === 'ValidationError') {
        const message = Object.values(error.errors)
            .map(err => err.message)
            .join(', ');
        return new AppError(message, 400);
    }

    // Handle mongoose duplicate key errors
    if (error.code === 11000) {
        const field = Object.keys(error.keyValue)[0];
        return new AppError(`Duplicate field value: ${field}`, 400);
    }

    // Handle mongoose cast errors
    if (error.name === 'CastError') {
        return new AppError(`Invalid ${error.path}: ${error.value}`, 400);
    }

    // Handle other errors
    return new AppError('Something went wrong', 500);
};

module.exports = {
    AppError,
    createError
}; 