/**
 * CORS Fallback Middleware
 * 
 * This middleware serves as a fallback for CORS issues by ensuring proper 
 * headers are set when the main CORS middleware might have missed them.
 * It particularly helps with preflight requests and provides additional logging.
 */
const corsFallback = (req, res, next) => {
    try {
        // Only apply fallback if CORS headers are not already set
        if (!res.get('Access-Control-Allow-Origin')) {
            // Get allowed origins from environment variables
            const allowedOrigins = process.env.CORS_ORIGIN 
                ? process.env.CORS_ORIGIN.split(',').map(o => o.trim())
                : ['https://www.bhavya.org.in', 'https://bhavya.org.in'];
            
            const origin = req.headers.origin;
            
            // Set Access-Control-Allow-Origin if the origin is allowed or in development
            if (!origin || allowedOrigins.includes(origin) || process.env.NODE_ENV !== 'production') {
                res.header('Access-Control-Allow-Origin', origin || '*');
                res.header('Access-Control-Allow-Credentials', 'true');
                res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
                res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
                
                console.log(`CORS Fallback applied for origin: ${origin || 'unknown'}`);
            }
        }
        
        // Handle preflight requests
        if (req.method === 'OPTIONS') {
            return res.status(204).end();
        }
        
        next();
    } catch (error) {
        console.error('CORS Fallback Error:', error);
        // Continue to next middleware even if there's an error with CORS
        next();
    }
};

module.exports = corsFallback;
