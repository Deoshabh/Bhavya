const express = require('express');
const router = express.Router();
const profileController = require('../controllers/profileController');
const auth = require('../middleware/auth');
const upload = require('../utils/localFileUpload');

// All profile routes require authentication
router.use(auth);

// Get user profile
router.get('/', profileController.getProfile);

// Update user profile
router.put('/', profileController.updateProfile);

// Upload profile photo - use the localFileUpload middleware
router.post('/upload-photo', upload.single('photo'), profileController.uploadProfilePhoto);

module.exports = router;