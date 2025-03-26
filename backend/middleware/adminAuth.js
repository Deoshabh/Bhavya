const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');

const adminAuth = async (req, res, next) => {
    try {
        // Get token from header
        const authHeader = req.headers.authorization;
        
        // Debug info
        console.log('Admin Auth middleware - Headers:', req.headers);
        console.log('Admin Auth middleware - Auth header:', authHeader);
        
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            console.log('Admin auth failed: No authorization header or invalid format');
            return res.status(401).json({ 
                success: false,
                message: 'Authentication required' 
            });
        }

        const token = authHeader.split(' ')[1];
        
        // Debug logs for troubleshooting
        console.log('Admin auth: token received, attempting verification');
        
        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log('Admin auth: token decoded:', decoded);
        
        // Check if it's an admin token
        if (!decoded.role || decoded.role !== 'admin') {
            console.log('Admin auth failed: Not an admin token', decoded);
            return res.status(403).json({ 
                success: false,
                message: 'Admin access required' 
            });
        }

        // Find admin
        const admin = await Admin.findById(decoded.id).select('-password');
        if (!admin) {
            console.log('Admin auth failed: Admin not found in database');
            return res.status(401).json({ 
                success: false,
                message: 'Admin not found' 
            });
        }

        // Check if admin is active
        if (admin.status !== 'active') {
            console.log('Admin auth failed: Admin account is inactive');
            return res.status(403).json({ 
                success: false,
                message: 'Admin account is inactive' 
            });
        }

        // Add admin to request
        req.admin = admin;
        console.log('Admin auth successful for:', admin.name);
        next();
    } catch (error) {
        console.error('Admin auth error:', error);
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ 
                success: false,
                message: 'Invalid token' 
            });
        }
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ 
                success: false,
                message: 'Token expired' 
            });
        }
        res.status(500).json({ 
            success: false,
            message: 'Server error' 
        });
    }
};

module.exports = adminAuth;