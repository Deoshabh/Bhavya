const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure upload directories exist with absolute paths
const uploadDir = path.resolve(__dirname, '..', 'uploads');
const profilesDir = path.resolve(uploadDir, 'profiles');
const eventsDir = path.resolve(uploadDir, 'events');

console.log('Setting up file upload directories:');
console.log('- Main uploads dir:', uploadDir);
console.log('- Profiles dir:', profilesDir);
console.log('- Events dir:', eventsDir);

// Create directories if they don't exist
[uploadDir, profilesDir, eventsDir].forEach(dir => {
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

// Configure storage for different file types
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        console.log(`Determining destination for file: ${file.fieldname}`);
        
        // Choose destination based on the route or field name
        let destinationDir;
        if (file.fieldname === 'photo') {
            destinationDir = profilesDir;
        } else if (file.fieldname === 'image') {
            destinationDir = eventsDir;
        } else {
            destinationDir = uploadDir;
        }
        
        console.log(`Selected destination: ${destinationDir}`);
        cb(null, destinationDir);
    },
    filename: function (req, file, cb) {
        // Create a unique filename
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        const filename = file.fieldname + '-' + uniqueSuffix + ext;
        
        console.log(`Generated filename: ${filename}`);
        cb(null, filename);
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
            console.error(`Rejected file with type: ${file.mimetype}`);
            return cb(new Error('Only image files are allowed'));
        }
        console.log(`Accepted file: ${file.originalname} (${file.mimetype})`);
        cb(null, true);
    }
});

module.exports = upload;
