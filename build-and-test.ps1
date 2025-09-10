# ===============================================
# Docker Build and Test Script for Bhavya Events (PowerShell)
# ===============================================

param(
    [string]$ImageName = "bhavya-events",
    [string]$ImageTag = "latest",
    [string]$ContainerName = "bhavya-events-test",
    [int]$Port = 5001
)

# Error handling
$ErrorActionPreference = "Stop"

# Colors for output
function Write-ColorOutput($ForegroundColor) {
    $fc = $host.UI.RawUI.ForegroundColor
    $host.UI.RawUI.ForegroundColor = $ForegroundColor
    if ($args) {
        Write-Output $args
    }
    $host.UI.RawUI.ForegroundColor = $fc
}

Write-ColorOutput Blue "==============================================="
Write-ColorOutput Blue "Building Bhavya Events Docker Image"
Write-ColorOutput Blue "==============================================="

try {
    # Build the Docker image
    Write-ColorOutput Yellow "Building Docker image..."
    docker build -t "${ImageName}:${ImageTag}" .
    
    if ($LASTEXITCODE -eq 0) {
        Write-ColorOutput Green "✓ Docker image built successfully"
    }
    else {
        throw "Docker image build failed"
    }
    
    # Test the Docker image
    Write-ColorOutput Yellow "Testing Docker image..."
    
    # Stop and remove existing container if it exists
    try {
        docker stop $ContainerName 2>$null
        docker rm $ContainerName 2>$null
    }
    catch {
        # Ignore errors if container doesn't exist
    }
    
    # Run the container in detached mode
    docker run -d `
        --name $ContainerName `
        -p "${Port}:${Port}" `
        -e NODE_ENV=production `
        -e PORT=$Port `
        -e FRONTEND_BUILD_PATH=/frontend/build `
        -e JWT_SECRET=test-jwt-secret-for-build-test-only `
        -e CORS_ORIGIN="http://localhost:${Port}" `
        "${ImageName}:${ImageTag}"
    
    if ($LASTEXITCODE -eq 0) {
        Write-ColorOutput Green "✓ Container started successfully"
    }
    else {
        throw "Container failed to start"
    }
    
    # Wait for the application to start
    Write-ColorOutput Yellow "Waiting for application to start..."
    Start-Sleep -Seconds 10
    
    # Test health endpoint
    Write-ColorOutput Yellow "Testing health endpoint..."
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:${Port}/health" -UseBasicParsing
        if ($response.StatusCode -eq 200) {
            Write-ColorOutput Green "✓ Health check passed"
        }
        else {
            Write-ColorOutput Red "✗ Health check failed (HTTP $($response.StatusCode))"
            throw "Health check failed"
        }
    }
    catch {
        Write-ColorOutput Red "✗ Health check failed: $($_.Exception.Message)"
        Write-ColorOutput Yellow "Container logs:"
        docker logs $ContainerName
        throw "Health check failed"
    }
    
    # Test API endpoint
    Write-ColorOutput Yellow "Testing API endpoint..."
    try {
        $apiResponse = Invoke-WebRequest -Uri "http://localhost:${Port}/api" -UseBasicParsing
        Write-ColorOutput Yellow "! API response: HTTP $($apiResponse.StatusCode) (404 expected for base path)"
    }
    catch {
        if ($_.Exception.Response.StatusCode.value__ -eq 404) {
            Write-ColorOutput Green "✓ API endpoint responding (404 expected for base path)"
        }
        else {
            Write-ColorOutput Yellow "! API response: $($_.Exception.Message)"
        }
    }
    
    # Show container info
    Write-ColorOutput Blue "==============================================="
    Write-ColorOutput Blue "Container Information"
    Write-ColorOutput Blue "==============================================="
    
    $containerId = docker ps -q -f "name=${ContainerName}"
    $imageSize = docker images "${ImageName}:${ImageTag}" --format "table {{.Size}}" | Select-Object -Skip 1
    $containerStatus = docker ps -f "name=${ContainerName}" --format "{{.Status}}"
    
    Write-ColorOutput Yellow "Container ID: $containerId"
    Write-ColorOutput Yellow "Image Size: $imageSize"
    Write-ColorOutput Yellow "Container Status: $containerStatus"
    
}
catch {
    Write-ColorOutput Red "Error: $($_.Exception.Message)"
    # Show container logs if container exists
    try {
        Write-ColorOutput Yellow "Container logs:"
        docker logs $ContainerName
    }
    catch {
        # Ignore if container doesn't exist
    }
    exit 1
}
finally {
    # Cleanup
    Write-ColorOutput Yellow "Cleaning up test container..."
    try {
        docker stop $ContainerName 2>$null
        docker rm $ContainerName 2>$null
    }
    catch {
        # Ignore cleanup errors
    }
}

Write-ColorOutput Green "==============================================="
Write-ColorOutput Green "Build and test completed successfully!"
Write-ColorOutput Green "==============================================="
Write-ColorOutput Yellow "Next steps:"
Write-Output "1. Push image to registry: docker push ${ImageName}:${ImageTag}"
Write-Output "2. Deploy to Dokploy using the deployment guide"
Write-Output "3. Configure environment variables in Dokploy"
Write-Output "4. Set up volume mounts for persistent data"
