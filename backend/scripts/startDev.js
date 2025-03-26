const { spawn } = require('child_process');
const path = require('path');
require('dotenv').config();

const startDev = async () => {
    try {
        console.log('🚀 Starting development server...');
        
        // Kill any existing processes on port 5001
        const killProcess = spawn('cmd', ['/c', 'netstat -ano | findstr :5001 > nul && taskkill /F /PID $(netstat -ano | findstr :5001 | awk \'{print $5}\') || echo "No process on port 5001"'], {
            shell: true
        });

        killProcess.on('close', (code) => {
            console.log('Port 5001 cleared');
            
            // Start the server
            const serverProcess = spawn('nodemon', ['server.js'], {
                stdio: 'inherit',
                shell: true,
                cwd: path.resolve(__dirname, '..')
            });

            serverProcess.on('error', (error) => {
                console.error('Failed to start server:', error);
                process.exit(1);
            });
        });

    } catch (error) {
        console.error('Startup error:', error);
        process.exit(1);
    }
};

startDev(); 