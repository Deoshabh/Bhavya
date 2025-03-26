const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure upload directories exist
const uploadDir = path.join(__dirname, '..', 'uploads');
const profilesDir = path.join(uploadDir, 'profiles');
const eventsDir = path.join(uploadDir, 'events');

// Create directories if they don't exist
[uploadDir, profilesDir, eventsDir].forEach(dir => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
});

// Configure storage for different file types
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        // Choose destination based on the route or field name
        if (file.fieldname === 'photo') {
            cb(null, profilesDir);
        } else if (file.fieldname === 'image') {
            cb(null, eventsDir);
        } else {
            cb(null, uploadDir);
        }
    },
    filename: function (req, file, cb) {
        // Create a unique filename
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        cb(null, file.fieldname + '-' + uniqueSuffix + ext);
    }
});

// Create multer instance with configuration
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB limit
    },
    fileFilter: (req, file, cb) => {
        // Check file type
        if (!file.mimetype.startsWith('image/')) {
            return cb(new Error('Only image files are allowed'));
        }
        cb(null, true);
    }
});

module.exports = upload;
