const express = require('express');
const router = express.Router();
const { getProfile, updateProfile, uploadProfilePhoto } = require('../controllers/profileController');
const auth = require('../middleware/auth');
const upload = require('../utils/fileUpload');

router.get('/', auth, getProfile);
router.put('/', auth, updateProfile);
router.post('/upload-photo', auth, upload.single('photo'), uploadProfilePhoto);

module.exports = router; 