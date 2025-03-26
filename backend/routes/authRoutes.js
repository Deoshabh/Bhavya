const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const auth = require('../middleware/auth');

// Public routes
router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/verify-token', auth, authController.verifyToken);

// Protected routes (require authentication)
router.use(auth);
router.get('/profile', (req, res) => {
    res.json({ user: req.user });
});

module.exports = router;