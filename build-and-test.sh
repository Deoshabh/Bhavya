#!/bin/bash

# ===============================================
# Docker Build and Test Script for Bhavya Events
# ===============================================

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
IMAGE_NAME="bhavya-events"
IMAGE_TAG="latest"
CONTAINER_NAME="bhavya-events-test"
PORT="5001"

echo -e "${BLUE}===============================================${NC}"
echo -e "${BLUE}Building Bhavya Events Docker Image${NC}"
echo -e "${BLUE}===============================================${NC}"

# Build the Docker image
echo -e "${YELLOW}Building Docker image...${NC}"
docker build -t ${IMAGE_NAME}:${IMAGE_TAG} .

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Docker image built successfully${NC}"
else
    echo -e "${RED}✗ Docker image build failed${NC}"
    exit 1
fi

# Test the Docker image
echo -e "${YELLOW}Testing Docker image...${NC}"

# Stop and remove existing container if it exists
docker stop ${CONTAINER_NAME} 2>/dev/null || true
docker rm ${CONTAINER_NAME} 2>/dev/null || true

# Run the container in detached mode
docker run -d \
    --name ${CONTAINER_NAME} \
    -p ${PORT}:${PORT} \
    -e NODE_ENV=production \
    -e PORT=${PORT} \
    -e FRONTEND_BUILD_PATH=/frontend/build \
    -e JWT_SECRET=test-jwt-secret-for-build-test-only \
    -e CORS_ORIGIN=http://localhost:${PORT} \
    ${IMAGE_NAME}:${IMAGE_TAG}

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Container started successfully${NC}"
else
    echo -e "${RED}✗ Container failed to start${NC}"
    exit 1
fi

# Wait for the application to start
echo -e "${YELLOW}Waiting for application to start...${NC}"
sleep 10

# Test health endpoint
echo -e "${YELLOW}Testing health endpoint...${NC}"
response=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:${PORT}/health)

if [ "$response" = "200" ]; then
    echo -e "${GREEN}✓ Health check passed${NC}"
else
    echo -e "${RED}✗ Health check failed (HTTP $response)${NC}"
    echo -e "${YELLOW}Container logs:${NC}"
    docker logs ${CONTAINER_NAME}
    docker stop ${CONTAINER_NAME}
    docker rm ${CONTAINER_NAME}
    exit 1
fi

# Test API endpoint
echo -e "${YELLOW}Testing API endpoint...${NC}"
api_response=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:${PORT}/api)

if [ "$api_response" = "404" ]; then
    echo -e "${GREEN}✓ API endpoint responding (404 expected for base path)${NC}"
else
    echo -e "${YELLOW}! API response: HTTP $api_response${NC}"
fi

# Show container info
echo -e "${BLUE}===============================================${NC}"
echo -e "${BLUE}Container Information${NC}"
echo -e "${BLUE}===============================================${NC}"
echo -e "${YELLOW}Container ID:${NC} $(docker ps -q -f name=${CONTAINER_NAME})"
echo -e "${YELLOW}Image Size:${NC} $(docker images ${IMAGE_NAME}:${IMAGE_TAG} --format "table {{.Size}}" | tail -n 1)"
echo -e "${YELLOW}Container Status:${NC} $(docker ps -f name=${CONTAINER_NAME} --format "{{.Status}}")"

# Cleanup
echo -e "${YELLOW}Cleaning up test container...${NC}"
docker stop ${CONTAINER_NAME}
docker rm ${CONTAINER_NAME}

echo -e "${GREEN}===============================================${NC}"
echo -e "${GREEN}Build and test completed successfully!${NC}"
echo -e "${GREEN}===============================================${NC}"
echo -e "${YELLOW}Next steps:${NC}"
echo -e "1. Push image to registry: ${BLUE}docker push ${IMAGE_NAME}:${IMAGE_TAG}${NC}"
echo -e "2. Deploy to Dokploy using the deployment guide"
echo -e "3. Configure environment variables in Dokploy"
echo -e "4. Set up volume mounts for persistent data"
