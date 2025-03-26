const fs = require('fs');
const path = require('path');

const requiredDependencies = [
    'express',
    'express-rate-limit',
    'cloudinary',
    'multer',
    'multer-storage-cloudinary',
    'dotenv',
    'mongoose',
    'jsonwebtoken',
    'bcryptjs',
    'cors'
];

const verifyDependencies = () => {
    const packageJsonPath = path.join(__dirname, '..', 'package.json');
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    const installedDependencies = Object.keys(packageJson.dependencies || {});

    const missingDependencies = requiredDependencies.filter(
        dep => !installedDependencies.includes(dep)
    );

    if (missingDependencies.length > 0) {
        console.error('Missing dependencies:', missingDependencies);
        console.log('\nRun the following command to install missing dependencies:');
        console.log(`npm install ${missingDependencies.join(' ')}`);
        process.exit(1);
    }

    console.log('All required dependencies are installed.');
};

verifyDependencies(); 