const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
require('dotenv').config();

const checkFiles = () => {
    const requiredFiles = [
        '.env',
        'models/Exhibition.js',
        'models/Ticket.js',
        'models/Booking.js',
        'models/User.js',
        'routes/tickets.js',
        'routes/exhibitions.js'
    ];

    const missingFiles = requiredFiles.filter(file => 
        !fs.existsSync(path.join(__dirname, '..', file))
    );

    if (missingFiles.length > 0) {
        console.error('❌ Missing required files:', missingFiles);
        return false;
    }
    console.log('✅ All required files present');
    return true;
};

const checkMongoDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ MongoDB Connected');
        console.log('Database:', conn.connection.name);
        await mongoose.connection.close();
        return true;
    } catch (error) {
        console.error('❌ MongoDB connection error:', error);
        return false;
    }
};

const checkEnvVariables = () => {
    const required = ['MONGODB_URI', 'PORT', 'JWT_SECRET', 'NODE_ENV'];
    const missing = required.filter(key => !process.env[key]);
    
    if (missing.length > 0) {
        console.error('❌ Missing environment variables:', missing);
        return false;
    }
    console.log('✅ All required environment variables present');
    return true;
};

const verifySetup = async () => {
    console.log('🔍 Verifying setup...\n');

    const filesOk = checkFiles();
    const envOk = checkEnvVariables();
    const dbOk = await checkMongoDB();

    if (filesOk && envOk && dbOk) {
        console.log('\n✅ Setup verification complete - all checks passed');
        process.exit(0);
    } else {
        console.error('\n❌ Setup verification failed - please fix the issues above');
        process.exit(1);
    }
};

verifySetup(); 