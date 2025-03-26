/**
 * Custom CORS debugging middleware
 */
const corsDebugger = (req, res, next) => {
    // Log the request origin and method
    console.log(`CORS Debug - ${req.method} request from: ${req.headers.origin || 'Unknown origin'}`);
    
    // If it's an OPTIONS request (preflight), log headers
    if (req.method === 'OPTIONS') {
        console.log('CORS Preflight Request Headers:', req.headers);
    }
    
    // Add CORS headers explicitly for debugging
    const allowedOrigins = process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',').map(o => o.trim()) : [];
    
    // Check if the origin is in our allowed list
    const origin = req.headers.origin;
    if (origin && allowedOrigins.includes(origin)) {
        res.header('Access-Control-Allow-Origin', origin);
        console.log(`Setting Access-Control-Allow-Origin: ${origin}`);
    } else if (origin) {
        console.log(`Origin ${origin} not in allowed list: ${allowedOrigins.join(', ')}`);
        
        // During debugging, allow all origins - REMOVE THIS IN PRODUCTION
        res.header('Access-Control-Allow-Origin', origin);
        console.log(`DEBUG MODE: Allowing ${origin} anyway for testing`);
    }
    
    // Set other CORS headers
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    
    // Handle preflight
    if (req.method === 'OPTIONS') {
        console.log('Responding to OPTIONS preflight request');
        return res.status(204).end();
    }
    
    next();
};

module.exports = corsDebugger;
