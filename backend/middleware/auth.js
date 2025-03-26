const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = async (req, res, next) => {
    try {
        // Get token from header
        const authHeader = req.headers.authorization;
        
        // Debug info
        console.log('Auth middleware - Headers:', req.headers);
        console.log('Auth middleware - Auth header:', authHeader);
        
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            console.log('Auth failed: No authorization header or invalid format');
            return res.status(401).json({ message: 'No authorization token, access denied' });
        }

        const token = authHeader.split(' ')[1];
        
        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log('Auth middleware - Token decoded:', decoded);
        
        // Check if token has userId (regular user) or id (admin)
        const userId = decoded.userId || decoded.id;
        
        if (!userId) {
            console.log('Auth failed: No user ID in token');
            return res.status(401).json({ message: 'Invalid token format' });
        }

        // Find user
        const user = await User.findById(userId).select('-password');
        if (!user) {
            console.log('Auth failed: User not found in database');
            return res.status(401).json({ message: 'User not found' });
        }

        // Check if user is active
        if (user.status === 'inactive' || user.status === 'suspended') {
            console.log('Auth failed: User account is inactive', user.status);
            return res.status(403).json({ message: 'Account is inactive' });
        }

        // Add user to request
        req.user = user;
        console.log('Auth successful for user:', user._id);
        next();
    } catch (error) {
        console.error('Auth middleware error:', error);
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ message: 'Invalid token' });
        }
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ message: 'Token expired' });
        }
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = auth;