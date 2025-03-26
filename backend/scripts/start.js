const { spawn } = require('child_process');
const path = require('path');
const mongoose = require('mongoose');
require('dotenv').config();

const runScript = (command, args, cwd) => {
    return new Promise((resolve, reject) => {
        const process = spawn(command, args, {
            cwd,
            stdio: 'inherit',
            shell: true
        });

        process.on('error', reject);
        process.on('exit', code => {
            if (code === 0) resolve();
            else reject(new Error(`Process exited with code ${code}`));
        });
    });
};

const checkMongoDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ MongoDB connection verified');
        await mongoose.connection.close();
    } catch (error) {
        console.error('❌ MongoDB connection failed:', error);
        throw error;
    }
};

const startServer = async () => {
    try {
        console.log('🚀 Starting server...');
        
        // Verify MongoDB connection first
        await checkMongoDB();
        
        // Drop existing tickets
        await runScript('npm', ['run', 'drop-tickets'], path.resolve(__dirname, '..'));
        console.log('✅ Dropped existing tickets');

        // Create test user
        await runScript('npm', ['run', 'create-test-user'], path.resolve(__dirname, '..'));
        console.log('✅ Created test user');

        // Seed tickets
        await runScript('npm', ['run', 'seed-tickets'], path.resolve(__dirname, '..'));
        console.log('✅ Seeded tickets');

        // Start the server
        console.log('🌐 Starting main server...');
        await runScript('nodemon', ['server.js'], path.resolve(__dirname, '..'));
    } catch (error) {
        console.error('❌ Error starting server:', error);
        process.exit(1);
    }
};

startServer(); 