const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');

const adminAuth = async (req, res, next) => {
    try {
        // Get token from header
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ message: 'Authentication required' });
        }

        const token = authHeader.split(' ')[1];
        
        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Check if it's an admin token
        if (!decoded.role || decoded.role !== 'admin') {
            return res.status(403).json({ message: 'Admin access required' });
        }

        // Find admin
        const admin = await Admin.findById(decoded.id).select('-password');
        if (!admin) {
            return res.status(401).json({ message: 'Admin not found' });
        }

        // Check if admin is active
        if (admin.status !== 'active') {
            return res.status(403).json({ message: 'Admin account is inactive' });
        }

        // Add admin to request
        req.admin = admin;
        next();
    } catch (error) {
        console.error('Admin auth error:', error);
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ message: 'Invalid token' });
        }
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ message: 'Token expired' });
        }
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = adminAuth; 