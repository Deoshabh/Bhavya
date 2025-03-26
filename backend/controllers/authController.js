const jwt = require('jsonwebtoken');
const User = require('../models/User');

exports.register = async (req, res) => {
    try {
        const { email, mobile } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({ 
            $or: [
                { email: email.toLowerCase() }, 
                { mobile }
            ] 
        });

        if (existingUser) {
            const field = existingUser.email === email.toLowerCase() ? 'email' : 'mobile';
            return res.status(400).json({ 
                message: `User already exists with this ${field}` 
            });
        }

        // Create new user
        const user = new User(req.body);
        await user.save();

        // Generate JWT
        const token = jwt.sign(
            { userId: user._id },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        // Remove sensitive data
        const userResponse = {
            id: user._id,
            name: user.name,
            email: user.email,
            mobile: user.mobile,
            userType: user.userType,
            organizationName: user.organizationName
        };

        res.status(201).json({
            token,
            user: userResponse
        });
    } catch (error) {
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({ message: messages[0] });
        }
        res.status(500).json({ message: 'Registration failed. Please try again.' });
    }
};

exports.login = async (req, res) => {
    try {
        const { email, mobile, password } = req.body;

        // Find user by email or mobile
        const user = await User.findOne({
            $or: [
                { email: email?.toLowerCase() || '' },
                { mobile: mobile || '' }
            ]
        });

        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Check password
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Generate JWT
        const token = jwt.sign(
            { userId: user._id },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        // Remove sensitive data
        const userResponse = {
            id: user._id,
            name: user.name,
            email: user.email,
            mobile: user.mobile,
            userType: user.userType,
            organizationName: user.organizationName
        };

        res.json({
            token,
            user: userResponse
        });
    } catch (error) {
        res.status(500).json({ message: 'Login failed. Please try again.' });
    }
};

// Add a more detailed verification endpoint for logged-in users
exports.verifyToken = async (req, res) => {
    try {
        // req.user is set by the auth middleware
        if (!req.user) {
            return res.status(401).json({ 
                success: false,
                message: 'No user found with this token' 
            });
        }

        // Find user and exclude password
        const user = await User.findById(req.user._id).select('-password');
        
        if (!user) {
            return res.status(404).json({ 
                success: false,
                message: 'User not found' 
            });
        }

        // Return successful verification with user data
        res.json({
            success: true,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                mobile: user.mobile,
                userType: user.userType,
                organizationName: user.organizationName || null,
                status: user.status
            }
        });
    } catch (error) {
        console.error('Token verification error:', error);
        res.status(500).json({ 
            success: false,
            message: 'Token verification failed',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Get current user info from token
exports.getCurrentUser = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('-password');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving user data' });
    }
};