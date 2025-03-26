const multer = require('multer');

// Configure multer for memory storage
const storage = multer.memoryStorage();

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

// Export middleware
module.exports = upload.single('image'); 