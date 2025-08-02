#!/bin/bash

# MediConnect AI Setup Script
# This script helps you set up the development environment quickly

echo "🏥 MediConnect AI - Setup Script"
echo "================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# Check if Node.js is installed
check_nodejs() {
    if command -v node &> /dev/null; then
        NODE_VERSION=$(node --version)
        print_status "Node.js is installed: $NODE_VERSION"
        
        # Check if version is 18 or higher
        NODE_MAJOR_VERSION=$(echo $NODE_VERSION | cut -d'.' -f1 | sed 's/v//')
        if [ "$NODE_MAJOR_VERSION" -ge 18 ]; then
            print_status "Node.js version is compatible"
        else
            print_warning "Node.js version should be 18 or higher"
        fi
    else
        print_error "Node.js is not installed. Please install Node.js 18+ first."
        exit 1
    fi
}

# Check if npm is installed
check_npm() {
    if command -v npm &> /dev/null; then
        NPM_VERSION=$(npm --version)
        print_status "npm is installed: $NPM_VERSION"
    else
        print_error "npm is not installed"
        exit 1
    fi
}

# Create directory structure
create_directories() {
    print_info "Creating directory structure..."
    
    # Backend directories
    mkdir -p backend/uploads/photos
    chmod 755 backend/uploads/photos
    
    print_status "Directory structure created"
}

# Generate security keys
generate_keys() {
    print_info "Generating security keys..."
    
    # Generate JWT secret
    JWT_SECRET=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
    JWT_REFRESH_SECRET=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
    ENCRYPTION_KEY=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
    
    print_status "Security keys generated"
}

# Create backend .env file
create_backend_env() {
    print_info "Creating backend .env file..."
    
    cat > backend/.env << EOF
# Server Configuration
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173

# Database Configuration (REPLACE WITH YOUR ACTUAL VALUES)
MONGODB_URI=mongodb+srv://mediconnect-user:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/mediconnect?retryWrites=true&w=majority
REDIS_URL=redis://localhost:6379

# JWT Configuration
JWT_SECRET=$JWT_SECRET
JWT_EXPIRES_IN=7d
JWT_REFRESH_SECRET=$JWT_REFRESH_SECRET
JWT_REFRESH_EXPIRES_IN=30d

# Encryption (HIPAA Compliance)
ENCRYPTION_KEY=$ENCRYPTION_KEY

# Google APIs (REPLACE WITH YOUR ACTUAL API KEYS)
GOOGLE_MAPS_API_KEY=your-google-maps-api-key
GEMINI_API_KEY=your-gemini-api-key

# Email Configuration (REPLACE WITH YOUR ACTUAL VALUES)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# SMS Configuration (REPLACE WITH YOUR ACTUAL VALUES)
TWILIO_ACCOUNT_SID=your-twilio-account-sid
TWILIO_AUTH_TOKEN=your-twilio-auth-token
TWILIO_PHONE_NUMBER=+1234567890

# File Upload Configuration
MAX_FILE_SIZE=10485760
UPLOAD_PATH=./uploads/photos

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Optional: Insurance APIs (Mock for now)
INSURANCE_API_KEY_BCBS=mock-key
INSURANCE_API_KEY_AETNA=mock-key
INSURANCE_API_KEY_CIGNA=mock-key

# Optional: Hospital APIs (Mock for now)
HOSPITAL_API_KEY_EPIC=mock-key
HOSPITAL_API_KEY_CERNER=mock-key

# Notification Settings
ENABLE_EMAIL_NOTIFICATIONS=true
ENABLE_SMS_NOTIFICATIONS=true
ENABLE_PUSH_NOTIFICATIONS=false
EOF

    print_status "Backend .env file created"
    print_warning "Please update the placeholder values in backend/.env with your actual API keys and credentials"
}

# Create frontend .env file
create_frontend_env() {
    print_info "Creating frontend .env file..."
    
    cat > .env << EOF
# API Configuration
VITE_API_BASE_URL=http://localhost:5000/api
VITE_BACKEND_URL=http://localhost:5000

# Google APIs (REPLACE WITH YOUR ACTUAL API KEYS)
VITE_GOOGLE_MAPS_API_KEY=your-google-maps-api-key
VITE_GEMINI_API_KEY=your-gemini-api-key

# App Configuration
VITE_APP_NAME=MediConnect AI
VITE_APP_VERSION=1.0.0
VITE_APP_DESCRIPTION=AI-powered healthcare booking and navigation platform
VITE_NODE_ENV=development

# WebSocket Configuration
VITE_WEBSOCKET_URL=ws://localhost:5000

# Feature Flags
VITE_ENABLE_VOICE_INPUT=true
VITE_ENABLE_PUSH_NOTIFICATIONS=true
VITE_ENABLE_GEOLOCATION=true
VITE_ENABLE_OFFLINE_MODE=false

# Optional: Analytics and Monitoring
VITE_SENTRY_DSN=your-sentry-dsn
VITE_ANALYTICS_ID=your-analytics-id

# Performance Settings
VITE_CACHE_DURATION=300000
VITE_MAX_CACHE_SIZE=50
VITE_DEFAULT_MAP_ZOOM=12
VITE_DEFAULT_SEARCH_RADIUS=25
VITE_DEFAULT_PAGE_SIZE=10
VITE_MAX_PAGE_SIZE=50
EOF

    print_status "Frontend .env file created"
    print_warning "Please update the placeholder values in .env with your actual API keys"
}

# Install backend dependencies
install_backend_deps() {
    print_info "Installing backend dependencies..."
    
    cd backend
    if npm install; then
        print_status "Backend dependencies installed successfully"
    else
        print_error "Failed to install backend dependencies"
        exit 1
    fi
    cd ..
}

# Install frontend dependencies
install_frontend_deps() {
    print_info "Installing frontend dependencies..."
    
    if npm install; then
        print_status "Frontend dependencies installed successfully"
    else
        print_error "Failed to install frontend dependencies"
        exit 1
    fi
}

# Create a .env.example file for reference
create_env_examples() {
    print_info "Creating .env.example files for reference..."
    
    # Backend .env.example already exists, just copy frontend
    cp .env .env.example
    
    print_status ".env.example files created"
}

# Display next steps
show_next_steps() {
    echo ""
    echo "🎉 Setup completed successfully!"
    echo "================================"
    echo ""
    echo "📋 Next Steps:"
    echo ""
    echo "1. 🗄️  Set up your databases:"
    echo "   - MongoDB Atlas: https://www.mongodb.com/atlas"
    echo "   - Redis Cloud: https://redis.com/redis-enterprise-cloud/"
    echo ""
    echo "2. 🔑 Get your API keys:"
    echo "   - Google Cloud Console: https://console.cloud.google.com/"
    echo "   - Enable Gemini AI and Maps APIs"
    echo ""
    echo "3. ✏️  Update environment variables:"
    echo "   - Edit backend/.env with your actual credentials"
    echo "   - Edit .env with your actual API keys"
    echo ""
    echo "4. 🚀 Start the development servers:"
    echo "   Backend:  cd backend && npm run dev"
    echo "   Frontend: npm run dev"
    echo ""
    echo "5. 🧪 Test your setup:"
    echo "   - Backend health: curl http://localhost:5000/api/health"
    echo "   - Frontend: http://localhost:5173"
    echo ""
    echo "📖 For detailed instructions, see CONFIGURATION_GUIDE.md"
    echo ""
    print_status "Happy coding! 🏥✨"
}

# Main execution
main() {
    echo ""
    print_info "Starting MediConnect AI setup..."
    echo ""
    
    check_nodejs
    check_npm
    create_directories
    generate_keys
    create_backend_env
    create_frontend_env
    install_backend_deps
    install_frontend_deps
    create_env_examples
    show_next_steps
}

# Run main function
main