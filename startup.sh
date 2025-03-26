#!/bin/bash

# Print environment for debugging
echo "NODE_ENV: $NODE_ENV"
echo "PORT: $PORT"
echo "FRONTEND_BUILD_PATH: $FRONTEND_BUILD_PATH"

# Create a directory for frontend files if it doesn't exist
mkdir -p /frontend/build

# Copy frontend files if available
if [ -d "/app/frontend/build" ]; then
  echo "Copying frontend files from /app/frontend/build to /frontend/build"
  cp -r /app/frontend/build/* /frontend/build/
else
  echo "No frontend files found at /app/frontend/build"
fi

# Start the application
cd /app
echo "Starting application"
npm start
