const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');

// Placeholder routes for now
router.post('/create-order', auth, (req, res) => {
    res.json({ message: 'Payment API working' });
});

module.exports = router; 