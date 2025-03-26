const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure upload directories exist with absolute paths
const uploadDir = path.resolve(__dirname, '..', 'uploads');
const adminDir = path.resolve(uploadDir, 'admin');
const eventsDir = path.resolve(uploadDir, 'events');

console.log('ImageUpload - Setting up upload directories:');
console.log('- Main uploads dir:', uploadDir);
console.log('- Admin dir:', adminDir);
console.log('- Events dir:', eventsDir);

// Create directories if they don't exist
[uploadDir, adminDir, eventsDir].forEach(dir => {
    if (!fs.existsSync(dir)) {
        console.log(`Creating directory: ${dir}`);
        fs.mkdirSync(dir, { recursive: true });
        
        // Set proper permissions on Unix systems
        if (process.platform !== 'win32') {
            try {
                fs.chmodSync(dir, 0o755);
                console.log(`Set permissions on: ${dir}`);
            } catch (err) {
                console.error(`Error setting permissions on ${dir}:`, err);
            }
        }
    }
});

// Configure storage
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        console.log('ImageUpload - Request path:', req.path);
        console.log('ImageUpload - File field name:', file.fieldname);
        
        // Determine appropriate destination based on route or field name
        let destinationDir;
        if (req.path.includes('admin')) {
            destinationDir = adminDir;
            console.log('Selected admin directory for upload');
        } else {
            destinationDir = eventsDir;
            console.log('Selected events directory for upload');
        }
        
        console.log('ImageUpload - Selected destination:', destinationDir);
        cb(null, destinationDir);
    },
    filename: function (req, file, cb) {
        // Extract original extension
        const ext = path.extname(file.originalname).toLowerCase();
        
        // Generate a unique filename with proper extension
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const safeFilename = file.fieldname + '-' + uniqueSuffix + ext;
        
        console.log('ImageUpload - Generated filename:', safeFilename);
        cb(null, safeFilename);
    }
});

// Create multer middleware with specific error handling
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    },
    fileFilter: (req, file, cb) => {
        console.log('ImageUpload - Received file:', file.originalname, file.mimetype);
        
        // Check if it's an image file
        if (!file.mimetype.startsWith('image/')) {
            console.error('Rejected non-image file:', file.mimetype);
            return cb(new Error('Only image files are allowed'));
        }
        
        // Accept only specific image types
        const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
        if (!allowedTypes.includes(file.mimetype)) {
            console.error('Rejected unsupported image type:', file.mimetype);
            return cb(new Error('Only JPG, PNG, GIF, and WebP images are allowed'));
        }
        
        console.log('ImageUpload - Accepted file:', file.originalname);
        cb(null, true);
    }
}).single('image');

// Export with enhanced error handling
module.exports = (req, res, next) => {
    upload(req, res, function (err) {
        if (err instanceof multer.MulterError) {
            // A Multer error occurred during upload
            console.error('Multer error:', err);
            return res.status(400).json({
                success: false,
                message: `Upload error: ${err.message}`
            });
        } else if (err) {
            // An unknown error occurred
            console.error('Unknown upload error:', err);
            return res.status(500).json({
                success: false,
                message: `Upload error: ${err.message}`
            });
        }
        
        if (req.file) {
            console.log('File uploaded successfully:', req.file.filename);
        } else {
            console.log('No file was uploaded');
        }
        
        // Success - proceed to next middleware
        next();
    });
};