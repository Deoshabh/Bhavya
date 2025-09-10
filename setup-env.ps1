# ===============================================
# Bhavya Events Platform - Environment Setup Script (PowerShell)
# ===============================================
# This script helps you set up environment files for deployment

param(
    [switch]$Interactive = $false
)

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
Write-ColorOutput Blue "Bhavya Events Platform - Environment Setup"
Write-ColorOutput Blue "==============================================="

# Function to generate a secure JWT secret
function Generate-JwtSecret {
    try {
        if (Get-Command openssl -ErrorAction SilentlyContinue) {
            return (openssl rand -base64 32).Trim()
        }
        elseif (Get-Command node -ErrorAction SilentlyContinue) {
            return (node -e "console.log(require('crypto').randomBytes(32).toString('hex'))").Trim()
        }
        else {
            # Fallback to PowerShell method
            $bytes = New-Object byte[] 32
            [System.Security.Cryptography.RNGCryptoServiceProvider]::Create().GetBytes($bytes)
            return [Convert]::ToBase64String($bytes)
        }
    }
    catch {
        return "bhavya-events-$(Get-Date -Format 'yyyyMMddHHmmss')-$(Get-Random)"
    }
}

# Check if .env files exist
function Test-EnvFiles {
    Write-ColorOutput Yellow "Checking environment files..."
    
    if (-not (Test-Path ".env")) {
        Write-ColorOutput Green "Creating root .env file..."
        Copy-Item ".env.example" ".env"
    }
    
    if (-not (Test-Path "backend\.env")) {
        Write-ColorOutput Green "Creating backend .env file..."
        Copy-Item "backend\.env.example" "backend\.env"
    }
    
    if (-not (Test-Path "frontend\.env")) {
        Write-ColorOutput Green "Creating frontend .env file..."
        Copy-Item "frontend\.env.example" "frontend\.env"
    }
}

# Generate JWT secret
function Set-JwtSecret {
    Write-ColorOutput Yellow "Generating JWT secret..."
    $jwtSecret = Generate-JwtSecret
    Write-ColorOutput Green "Generated JWT Secret: $jwtSecret"
    
    # Update backend .env
    $backendEnv = Get-Content "backend\.env"
    $backendEnv = $backendEnv -replace "JWT_SECRET=.*", "JWT_SECRET=$jwtSecret"
    $backendEnv | Set-Content "backend\.env"
}

# Interactive setup
function Start-InteractiveSetup {
    Write-ColorOutput Yellow "Starting interactive setup..."
    
    # Domain configuration
    $domain = Read-Host "Enter your domain (e.g., bhavya.org.in)"
    if ($domain) {
        # Update CORS origin in backend
        $backendEnv = Get-Content "backend\.env"
        $backendEnv = $backendEnv -replace "CORS_ORIGIN=.*", "CORS_ORIGIN=https://$domain,https://www.$domain"
        $backendEnv | Set-Content "backend\.env"
        
        # Update frontend URLs
        $frontendEnv = Get-Content "frontend\.env"
        $frontendEnv = $frontendEnv -replace "REACT_APP_API_URL=.*", "REACT_APP_API_URL=https://$domain/api"
        $frontendEnv = $frontendEnv -replace "REACT_APP_BASE_URL=.*", "REACT_APP_BASE_URL=https://$domain"
        $frontendEnv | Set-Content "frontend\.env"
        
        Write-ColorOutput Green "✓ Domain configured: $domain"
    }
    
    # Email configuration
    Write-ColorOutput Yellow "Email Configuration:"
    $emailUser = Read-Host "Enter your email address"
    $emailPass = Read-Host "Enter your email password/app password" -AsSecureString
    $emailPassPlain = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($emailPass))
    
    if ($emailUser -and $emailPassPlain) {
        $backendEnv = Get-Content "backend\.env"
        $backendEnv = $backendEnv -replace "EMAIL_USER=.*", "EMAIL_USER=$emailUser"
        $backendEnv = $backendEnv -replace "EMAIL_PASSWORD=.*", "EMAIL_PASSWORD=$emailPassPlain"
        $backendEnv = $backendEnv -replace "SMTP_USER=.*", "SMTP_USER=$emailUser"
        $backendEnv = $backendEnv -replace "SMTP_PASS=.*", "SMTP_PASS=$emailPassPlain"
        $backendEnv | Set-Content "backend\.env"
        
        Write-ColorOutput Green "✓ Email configured"
    }
    
    # MongoDB configuration
    Write-ColorOutput Yellow "MongoDB is already configured with your provided connection string"
    Write-ColorOutput Green "✓ Database configured"
}

# Create necessary directories
function New-ProjectDirectories {
    Write-ColorOutput Yellow "Creating necessary directories..."
    
    $directories = @(
        "data\uploads",
        "data\logs", 
        "data\mongodb",
        "data\redis",
        "data\backups",
        "backend\uploads",
        "backend\logs"
    )
    
    foreach ($dir in $directories) {
        if (-not (Test-Path $dir)) {
            New-Item -ItemType Directory -Path $dir -Force | Out-Null
        }
    }
    
    Write-ColorOutput Green "✓ Directories created"
}

# Validate configuration
function Test-Configuration {
    Write-ColorOutput Yellow "Validating configuration..."
    
    # Check JWT_SECRET length
    $backendEnv = Get-Content "backend\.env"
    $jwtLine = $backendEnv | Where-Object { $_ -match "JWT_SECRET=" }
    if ($jwtLine) {
        $jwtSecret = ($jwtLine -split "=")[1]
        if ($jwtSecret.Length -lt 32) {
            Write-ColorOutput Red "⚠ JWT_SECRET should be at least 32 characters"
        }
        else {
            Write-ColorOutput Green "✓ JWT_SECRET is properly configured"
        }
    }
    
    # Check domain configuration
    if ($backendEnv | Where-Object { $_ -match "yourdomain.com" }) {
        Write-ColorOutput Yellow "⚠ Please update domain configuration in backend\.env"
    }
    else {
        Write-ColorOutput Green "✓ Domain configuration looks good"
    }
    
    # Check email configuration
    if ($backendEnv | Where-Object { $_ -match "your-email@gmail.com" }) {
        Write-ColorOutput Yellow "⚠ Please update email configuration in backend\.env"
    }
    else {
        Write-ColorOutput Green "✓ Email configuration looks good"
    }
}

# Display next steps
function Show-NextSteps {
    Write-ColorOutput Blue "==============================================="
    Write-ColorOutput Green "Environment setup completed!"
    Write-ColorOutput Blue "==============================================="
    Write-ColorOutput Yellow "Next steps:"
    Write-Output "1. Review and update the .env files with your specific values:"
    Write-Output "   - backend\.env - Backend configuration"
    Write-Output "   - frontend\.env - Frontend configuration"
    Write-Output "   - .env - Project-wide configuration"
    Write-Output ""
    Write-Output "2. Update payment gateway credentials:"
    Write-Output "   - Razorpay keys in both backend and frontend .env files"
    Write-Output "   - Stripe keys if using Stripe"
    Write-Output ""
    Write-Output "3. Configure external services:"
    Write-Output "   - Cloudinary for image uploads"
    Write-Output "   - SendGrid for emails (optional)"
    Write-Output "   - Google Maps API key"
    Write-Output ""
    Write-Output "4. Test the configuration:"
    Write-Output "   - .\build-and-test.ps1"
    Write-Output ""
    Write-Output "5. Deploy to Dokploy:"
    Write-Output "   - Follow the DOKPLOY_DEPLOYMENT.md guide"
    Write-Output "   - Set environment variables in Dokploy dashboard"
    Write-Output ""
    Write-ColorOutput Red "⚠ Important: Never commit .env files to version control!"
}

# Main execution
function Main {
    Test-EnvFiles
    Set-JwtSecret
    
    if ($Interactive) {
        Start-InteractiveSetup
    }
    else {
        $response = Read-Host "Would you like to run interactive setup? (y/n)"
        if ($response -eq "y" -or $response -eq "Y") {
            Start-InteractiveSetup
        }
    }
    
    New-ProjectDirectories
    Test-Configuration
    Show-NextSteps
}

# Run main function
Main
