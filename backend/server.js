require('dotenv').config();
const express = require('express');
const app = express();

// Trust proxy settings - place this at the top of your file
app.set('trust proxy', true);
app.enable('trust proxy');

const mongoose = require('mongoose');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');
const adminRoutes = require('./routes/adminRoutes');
const eventRoutes = require('./routes/eventRoutes');
const authRoutes = require('./routes/authRoutes');
const ticketRoutes = require('./routes/ticketRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const profileRoutes = require('./routes/profileRoutes');
const path = require('path');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');
const compression = require('compression');
const cors = require('cors');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const fs = require('fs');

// Trust proxy - this is critical for rate limiting behind a proxy
app.set('trust proxy', 'loopback, linklocal, uniquelocal'); // More comprehensive setting

// Add these lines right after the app initialization for debugging CORS issues
app.use((req, res, next) => {
    console.log('Request Origin:', req.headers.origin);
    console.log('Allowed Origins:', process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : 'none');
    next();
});

// Security middleware
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", 'https://checkout.razorpay.com'],
            styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
            fontSrc: ["'self'", 'https://fonts.gstatic.com'],
            imgSrc: ["'self'", 'data:', 'https:', 'blob:'],
            connectSrc: ["'self'", 'https://api.razorpay.com'],
        },
    },
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: false,
}));

// Update CORS configuration
const corsOptions = {
  origin: function(origin, callback) {
    console.log(`CORS request from origin: ${origin}`);
    
    // Get allowed origins from env
    const allowedOrigins = process.env.CORS_ORIGIN 
      ? process.env.CORS_ORIGIN.split(',').map(o => o.trim()) 
      : ['https://www.bhavya.org.in', 'https://bhavya.org.in',];
    
    console.log('Configured allowed origins:', allowedOrigins);
    
    // Always allow if origin is in our list or not provided
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.log(`Origin ${origin} not allowed by CORS`);
      // For debugging in production - you can remove this line later
      callback(null, true);
      // Uncomment for strict CORS:
      // callback(new Error(`Origin ${origin} not allowed by CORS`));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['Content-Range', 'X-Content-Range'],
  maxAge: 86400, // 24 hours
  preflightContinue: false,
  optionsSuccessStatus: 204
};

// Apply CORS before other middleware that might interfere
app.use(cors(corsOptions));

const corsFallback = require('./middleware/corsFallback');

// Add this after your existing CORS middleware
app.use(corsFallback);

// Data sanitization
app.use(mongoSanitize()); // Against NoSQL injection
app.use(xss()); // Against XSS attacks
app.use(hpp()); // Against HTTP Parameter Pollution

// Compression
app.use(compression({
    filter: (req, res) => {
        if (req.headers['x-no-compression']) return false;
        return compression.filter(req, res);
    },
    level: 6 // Balanced setting between speed and compression
}));

// Rate limiting - Global
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
});
app.use(limiter);

// API specific rate limits
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 50,
    message: 'Too many API requests from this IP, please try again later',
    trustProxy: true, // Explicitly trust the proxy
});
app.use('/api/', apiLimiter);

// Auth route specific limiter
const authLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour window
    max: 5, // start blocking after 5 requests
    message: 'Too many login attempts from this IP, please try again after an hour',
    trustProxy: true, // Explicitly trust the proxy
});
app.use('/api/auth/login', authLimiter);

// Middleware
app.use(express.json({ limit: '10kb' })); // Body size limit
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// Logging
if (process.env.NODE_ENV === 'production') {
    app.use(morgan('combined', {
        skip: (req, res) => res.statusCode < 400,
        stream: require('rotating-file-stream').createStream('access.log', {
            interval: '1d',
            path: path.join(__dirname, 'logs')
        })
    }));
} else {
    app.use(morgan('dev'));
}

// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'UP',
        timestamp: new Date(),
        uptime: process.uptime(),
    });
});

// Add this before the API routes
app.get('/', (req, res) => {
    res.json({
        status: 'success',
        message: 'Welcome to the API',
        version: '1.0.0',
        endpoints: {
            health: '/health',
            api: '/api',
            docs: '/api-docs'
        }
    });
});

// Fix for static files - ensure these lines are BEFORE the API routes
// Create absolute path to uploads directory
const uploadsPath = path.join(__dirname, 'uploads');
console.log('Uploads directory path:', uploadsPath);

// Ensure uploads directory exists
if (!fs.existsSync(uploadsPath)) {
    console.log('Creating uploads directory');
    fs.mkdirSync(uploadsPath, { recursive: true });
}

// Set proper permissions on uploads directory (Unix systems only)
if (process.platform !== 'win32') {
    try {
        fs.chmodSync(uploadsPath, 0o755);
        console.log('Set permissions on uploads directory');
    } catch (err) {
        console.error('Error setting uploads directory permissions:', err);
    }
}

// Serve static files explicitly with options
app.use('/uploads', express.static(uploadsPath, {
    dotfiles: 'ignore',
    etag: true,
    index: false,
    maxAge: '1d',
    redirect: false,
    setHeaders: function (res, path, stat) {
        res.set('x-timestamp', Date.now());
        // Ensure CORS headers if needed
        res.set('Access-Control-Allow-Origin', '*');
        // Set content type correctly for images
        if (path.endsWith('.jpg') || path.endsWith('.jpeg')) {
            res.set('Content-Type', 'image/jpeg');
        } else if (path.endsWith('.png')) {
            res.set('Content-Type', 'image/png');
        } else if (path.endsWith('.gif')) {
            res.set('Content-Type', 'image/gif');
        }
    }
}));

// Temporary debugging endpoint to check if files exist
app.get('/check-image/:filename', (req, res) => {
    const filePath = path.join(uploadsPath, req.params.filename);
    const fileExists = fs.existsSync(filePath);
    
    if (fileExists) {
        const stats = fs.statSync(filePath);
        res.json({
            exists: true,
            size: stats.size,
            path: filePath,
            publicUrl: `${req.protocol}://${req.get('host')}/uploads/${req.params.filename}`
        });
    } else {
        res.json({
            exists: false,
            checkedPath: filePath
        });
    }
});

// Ensure serving static files for uploaded images
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/tickets', ticketRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/profile', profileRoutes);

// Add additional mounting point for auth routes without the /api prefix
// This ensures compatibility with frontend requests to /auth/register
app.use('/auth', authRoutes);
// Also mount profile routes without /api prefix for compatibility
app.use('/profile', profileRoutes);

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
    console.log('Running in production mode, attempting to serve static files');
    
    // Use absolute path resolution with proper fallbacks
    const frontendPath = process.env.FRONTEND_BUILD_PATH 
        ? path.resolve(process.env.FRONTEND_BUILD_PATH)
        : path.resolve(__dirname, '..', 'frontend', 'build');
    
    console.log(`Looking for frontend files at: ${frontendPath}`);
    
    try {
        // Check if directory exists
        if (fs.existsSync(frontendPath)) {
            console.log(`Frontend directory found at ${frontendPath}`);
            
            // Serve static files with explicit options
            app.use(express.static(frontendPath, {
                index: 'index.html',
                setHeaders: (res, filePath) => {
                    // Set proper caching headers for static assets
                    if (filePath.endsWith('.html')) {
                        // Don't cache HTML files
                        res.setHeader('Cache-Control', 'no-cache');
                    } else if (filePath.match(/\.(js|css|png|jpg|jpeg|gif|ico|svg)$/)) {
                        // Cache assets for 1 day
                        res.setHeader('Cache-Control', 'public, max-age=86400');
                    }
                }
            }));
            
            // Handle client-side routing by serving index.html for non-API routes
            app.get('*', (req, res, next) => {
                // Skip API routes and upload routes
                if (req.path.startsWith('/api') || 
                    req.path === '/health' || 
                    req.path.startsWith('/uploads') ||
                    req.path.startsWith('/check-image')) {
                    return next();
                }
                
                const indexPath = path.join(frontendPath, 'index.html');
                console.log(`Attempting to serve: ${indexPath}`);
                
                if (fs.existsSync(indexPath)) {
                    console.log(`Serving index.html from ${indexPath}`);
                    res.sendFile(indexPath);
                } else {
                    console.error(`Index file not found at ${indexPath}`);
                    res.status(404).send(`
                        <h1>Error: Frontend Index File Not Found</h1>
                        <p>The frontend build exists but index.html was not found.</p>
                        <p>Expected location: ${indexPath}</p>
                        <p>API routes are still available.</p>
                    `);
                }
            });
        } else {
            console.error(`Frontend directory not found at ${frontendPath}`);
            
            // Create the directory structure in case it doesn't exist
            try {
                fs.mkdirSync(frontendPath, { recursive: true });
                console.log(`Created frontend directory structure at ${frontendPath}`);
                console.log('Please build and deploy your frontend to this location');
            } catch (mkdirErr) {
                console.error(`Failed to create frontend directory: ${mkdirErr.message}`);
            }
            
            // Add a fallback handler for non-API routes to show a helpful message
            app.get('*', (req, res, next) => {
                if (req.path.startsWith('/api') || 
                    req.path === '/health' || 
                    req.path.startsWith('/uploads') ||
                    req.path.startsWith('/check-image')) {
                    return next();
                }
                
                res.status(404).send(`
                    <h1>Frontend Build Not Found</h1>
                    <p>Frontend build directory not found at: ${frontendPath}</p>
                    <p>API routes are still available.</p>
                    <p>To fix this:</p>
                    <ol>
                        <li>Make sure you've built your React frontend with 'npm run build'</li>
                        <li>Copy the build folder to: ${frontendPath}</li>
                        <li>Or set FRONTEND_BUILD_PATH environment variable to your build location</li>
                        <li>Restart the server</li>
                    </ol>
                    <p>Server running in: ${process.env.NODE_ENV} mode</p>
                `);
            });
        }
    } catch (err) {
        console.error(`Error setting up static files: ${err.message}`);
    }
}

// Error handling middleware
app.use(errorHandler);

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        status: 'error',
        message: 'Route not found'
    });
});

// Global error handler
app.use((err, req, res, next) => {
    const status = err.status || 500;
    const message = process.env.NODE_ENV === 'production' 
        ? 'Internal server error' 
        : err.message;
    
    // Log error
    console.error(err);

    res.status(status).json({
        status: 'error',
        message,
        ...(process.env.NODE_ENV !== 'production' && { stack: err.stack })
    });
});

// Start server with graceful shutdown
const startServer = async () => {
    try {
        // Connect to MongoDB
        await connectDB();
        console.log('MongoDB Connected Successfully');

        const server = app.listen(process.env.PORT || 5000, () => {
            console.log(`Server running in ${process.env.NODE_ENV} mode on port ${process.env.PORT}`);
        });

        // Graceful shutdown
        process.on('SIGTERM', () => gracefulShutdown(server));
        process.on('SIGINT', () => gracefulShutdown(server));

    } catch (error) {
        console.error('Failed to connect to MongoDB:', error);
        process.exit(1);
    }
};

async function gracefulShutdown(server) {
    console.log('Received kill signal, shutting down gracefully');
    
    try {
        // Close MongoDB connection
        await mongoose.connection.close();
        console.log('MongoDB connection closed');

        // Close Express server
        server.close(() => {
            console.log('Closed out remaining connections');
            process.exit(0);
        });

        // Force close after 10 secs
        setTimeout(() => {
            console.error('Could not close connections in time, forcefully shutting down');
            process.exit(1);
        }, 10000);
    } catch (error) {
        console.error('Error during shutdown:', error);
        process.exit(1);
    }
}

// Start the server
startServer();