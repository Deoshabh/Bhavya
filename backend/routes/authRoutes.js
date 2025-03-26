const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const auth = require('../middleware/auth');

// Public routes
router.post('/register', authController.register);
router.post('/login', authController.login);

// Support both GET and POST for token verification for better compatibility
router.get('/verify-token', auth, authController.verifyToken);
router.post('/verify-token', auth, authController.verifyToken);

// Add more user info endpoint
router.get('/me', auth, authController.getCurrentUser);

// Protected routes (require authentication)
router.use(auth);
router.get('/profile', (req, res) => {
    res.json({ user: req.user });
});

module.exports = router;