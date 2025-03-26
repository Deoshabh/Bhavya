const fs = require('fs');
const path = require('path');

// Print environment variables
console.log('Environment Variables:');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('PORT:', process.env.PORT);
console.log('FRONTEND_BUILD_PATH:', process.env.FRONTEND_BUILD_PATH);
console.log('CORS_ORIGIN:', process.env.CORS_ORIGIN);

// Check various paths
const pathsToCheck = [
  '/frontend/build',
  '/frontend/build/index.html',
  '/app/frontend/build',
  '/app/frontend/build/index.html',
  path.resolve(__dirname, '../frontend/build'),
  path.resolve(__dirname, '../frontend/build/index.html')
];

console.log('\nPath Checks:');
pathsToCheck.forEach(pathToCheck => {
  try {
    const exists = fs.existsSync(pathToCheck);
    console.log(`${pathToCheck}: ${exists ? 'Exists' : 'Does not exist'}`);
    if (exists) {
      const stats = fs.statSync(pathToCheck);
      console.log(`  Type: ${stats.isDirectory() ? 'Directory' : 'File'}`);
      if (stats.isFile()) {
        console.log(`  Size: ${stats.size} bytes`);
      } else {
        const files = fs.readdirSync(pathToCheck);
        console.log(`  Contents: ${files.length} items`);
        console.log(`  Items: ${files.slice(0, 5).join(', ')}${files.length > 5 ? '...' : ''}`);
      }
    }
  } catch (err) {
    console.log(`${pathToCheck}: Error - ${err.message}`);
  }
});

console.log('\nDebug Complete');
