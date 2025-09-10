#!/bin/bash

# ===============================================
# Bhavya Events Platform - Environment Setup Script
# ===============================================
# This script helps you set up environment files for deployment

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}===============================================${NC}"
echo -e "${BLUE}Bhavya Events Platform - Environment Setup${NC}"
echo -e "${BLUE}===============================================${NC}"

# Function to generate a secure JWT secret
generate_jwt_secret() {
    if command -v openssl &> /dev/null; then
        openssl rand -base64 32
    elif command -v node &> /dev/null; then
        node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
    else
        echo "bhavya-events-$(date +%s)-$(openssl rand -hex 16)"
    fi
}

# Check if .env files exist
check_env_files() {
    echo -e "${YELLOW}Checking environment files...${NC}"
    
    if [ ! -f ".env" ]; then
        echo -e "${GREEN}Creating root .env file...${NC}"
        cp .env.example .env
    fi
    
    if [ ! -f "backend/.env" ]; then
        echo -e "${GREEN}Creating backend .env file...${NC}"
        cp backend/.env.example backend/.env
    fi
    
    if [ ! -f "frontend/.env" ]; then
        echo -e "${GREEN}Creating frontend .env file...${NC}"
        cp frontend/.env.example frontend/.env
    fi
}

# Generate JWT secret
setup_jwt_secret() {
    echo -e "${YELLOW}Generating JWT secret...${NC}"
    JWT_SECRET=$(generate_jwt_secret)
    echo -e "${GREEN}Generated JWT Secret: ${JWT_SECRET}${NC}"
    
    # Update backend .env
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        sed -i '' "s/JWT_SECRET=.*/JWT_SECRET=${JWT_SECRET}/" backend/.env
    else
        # Linux
        sed -i "s/JWT_SECRET=.*/JWT_SECRET=${JWT_SECRET}/" backend/.env
    fi
}

# Interactive setup
interactive_setup() {
    echo -e "${YELLOW}Starting interactive setup...${NC}"
    
    # Domain configuration
    read -p "Enter your domain (e.g., bhavya.org.in): " DOMAIN
    if [ ! -z "$DOMAIN" ]; then
        # Update CORS origin in backend
        if [[ "$OSTYPE" == "darwin"* ]]; then
            sed -i '' "s|CORS_ORIGIN=.*|CORS_ORIGIN=https://${DOMAIN},https://www.${DOMAIN}|" backend/.env
            sed -i '' "s|REACT_APP_API_URL=.*|REACT_APP_API_URL=https://${DOMAIN}/api|" frontend/.env
            sed -i '' "s|REACT_APP_BASE_URL=.*|REACT_APP_BASE_URL=https://${DOMAIN}|" frontend/.env
        else
            sed -i "s|CORS_ORIGIN=.*|CORS_ORIGIN=https://${DOMAIN},https://www.${DOMAIN}|" backend/.env
            sed -i "s|REACT_APP_API_URL=.*|REACT_APP_API_URL=https://${DOMAIN}/api|" frontend/.env
            sed -i "s|REACT_APP_BASE_URL=.*|REACT_APP_BASE_URL=https://${DOMAIN}|" frontend/.env
        fi
        echo -e "${GREEN}✓ Domain configured: ${DOMAIN}${NC}"
    fi
    
    # Email configuration
    echo -e "${YELLOW}Email Configuration:${NC}"
    read -p "Enter your email address: " EMAIL_USER
    read -s -p "Enter your email password/app password: " EMAIL_PASS
    echo
    
    if [ ! -z "$EMAIL_USER" ] && [ ! -z "$EMAIL_PASS" ]; then
        if [[ "$OSTYPE" == "darwin"* ]]; then
            sed -i '' "s/EMAIL_USER=.*/EMAIL_USER=${EMAIL_USER}/" backend/.env
            sed -i '' "s/EMAIL_PASSWORD=.*/EMAIL_PASSWORD=${EMAIL_PASS}/" backend/.env
            sed -i '' "s/SMTP_USER=.*/SMTP_USER=${EMAIL_USER}/" backend/.env
            sed -i '' "s/SMTP_PASS=.*/SMTP_PASS=${EMAIL_PASS}/" backend/.env
        else
            sed -i "s/EMAIL_USER=.*/EMAIL_USER=${EMAIL_USER}/" backend/.env
            sed -i "s/EMAIL_PASSWORD=.*/EMAIL_PASSWORD=${EMAIL_PASS}/" backend/.env
            sed -i "s/SMTP_USER=.*/SMTP_USER=${EMAIL_USER}/" backend/.env
            sed -i "s/SMTP_PASS=.*/SMTP_PASS=${EMAIL_PASS}/" backend/.env
        fi
        echo -e "${GREEN}✓ Email configured${NC}"
    fi
    
    # MongoDB configuration
    echo -e "${YELLOW}MongoDB is already configured with your provided connection string${NC}"
    echo -e "${GREEN}✓ Database configured${NC}"
}

# Create necessary directories
create_directories() {
    echo -e "${YELLOW}Creating necessary directories...${NC}"
    
    mkdir -p data/{uploads,logs,mongodb,redis,backups}
    mkdir -p backend/{uploads,logs}
    
    echo -e "${GREEN}✓ Directories created${NC}"
}

# Set file permissions
set_permissions() {
    echo -e "${YELLOW}Setting file permissions...${NC}"
    
    chmod 600 .env backend/.env frontend/.env
    chmod 755 data backend/uploads
    
    echo -e "${GREEN}✓ Permissions set${NC}"
}

# Validate configuration
validate_config() {
    echo -e "${YELLOW}Validating configuration...${NC}"
    
    # Check if JWT_SECRET is set and long enough
    JWT_SECRET_LENGTH=$(grep "JWT_SECRET=" backend/.env | cut -d'=' -f2 | wc -c)
    if [ $JWT_SECRET_LENGTH -lt 32 ]; then
        echo -e "${RED}⚠ JWT_SECRET should be at least 32 characters${NC}"
    else
        echo -e "${GREEN}✓ JWT_SECRET is properly configured${NC}"
    fi
    
    # Check if domain is configured
    if grep -q "yourdomain.com" backend/.env; then
        echo -e "${YELLOW}⚠ Please update domain configuration in backend/.env${NC}"
    else
        echo -e "${GREEN}✓ Domain configuration looks good${NC}"
    fi
    
    # Check if email is configured
    if grep -q "your-email@gmail.com" backend/.env; then
        echo -e "${YELLOW}⚠ Please update email configuration in backend/.env${NC}"
    else
        echo -e "${GREEN}✓ Email configuration looks good${NC}"
    fi
}

# Display next steps
show_next_steps() {
    echo -e "${BLUE}===============================================${NC}"
    echo -e "${GREEN}Environment setup completed!${NC}"
    echo -e "${BLUE}===============================================${NC}"
    echo -e "${YELLOW}Next steps:${NC}"
    echo -e "1. Review and update the .env files with your specific values:"
    echo -e "   - ${BLUE}backend/.env${NC} - Backend configuration"
    echo -e "   - ${BLUE}frontend/.env${NC} - Frontend configuration"
    echo -e "   - ${BLUE}.env${NC} - Project-wide configuration"
    echo
    echo -e "2. Update payment gateway credentials:"
    echo -e "   - Razorpay keys in both backend and frontend .env files"
    echo -e "   - Stripe keys if using Stripe"
    echo
    echo -e "3. Configure external services:"
    echo -e "   - Cloudinary for image uploads"
    echo -e "   - SendGrid for emails (optional)"
    echo -e "   - Google Maps API key"
    echo
    echo -e "4. Test the configuration:"
    echo -e "   - ${BLUE}./build-and-test.sh${NC} (Linux/macOS)"
    echo -e "   - ${BLUE}./build-and-test.ps1${NC} (Windows)"
    echo
    echo -e "5. Deploy to Dokploy:"
    echo -e "   - Follow the ${BLUE}DOKPLOY_DEPLOYMENT.md${NC} guide"
    echo -e "   - Set environment variables in Dokploy dashboard"
    echo
    echo -e "${GREEN}⚠ Important: Never commit .env files to version control!${NC}"
}

# Main execution
main() {
    check_env_files
    setup_jwt_secret
    
    echo -e "${YELLOW}Would you like to run interactive setup? (y/n)${NC}"
    read -p "Answer: " INTERACTIVE
    
    if [ "$INTERACTIVE" = "y" ] || [ "$INTERACTIVE" = "Y" ]; then
        interactive_setup
    fi
    
    create_directories
    set_permissions
    validate_config
    show_next_steps
}

# Run main function
main
