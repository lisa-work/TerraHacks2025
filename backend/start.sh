#!/bin/bash

# Healthcare App Backend Startup Script

echo "🏥 Healthcare App Backend Startup"
echo "=================================="

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js v16 or higher."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 16 ]; then
    echo "❌ Node.js version 16 or higher is required. Current version: $(node -v)"
    exit 1
fi

echo "✅ Node.js version: $(node -v)"

# Check if MongoDB is running
if ! pgrep -x "mongod" > /dev/null; then
    echo "⚠️  MongoDB is not running. Please start MongoDB:"
    echo "   mongod"
    echo ""
    read -p "Continue anyway? (y/n): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
else
    echo "✅ MongoDB is running"
fi

# Check if Redis is running
if ! pgrep -x "redis-server" > /dev/null; then
    echo "⚠️  Redis is not running. Please start Redis:"
    echo "   redis-server"
    echo ""
    read -p "Continue anyway? (y/n): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
else
    echo "✅ Redis is running"
fi

# Check if .env file exists
if [ ! -f .env ]; then
    echo "⚠️  .env file not found. Creating template..."
    cat > .env << EOF
VITE_GEMINI_API_KEY=your_gemini_key_here
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_key_here
VITE_API_BASE_URL=http://localhost:5000
DB_URI=mongodb://localhost:27017/healthcare_app
REDIS_URL=redis://localhost:6379
AUTH_PROVIDER=auth0
JWT_SECRET=your_secure_jwt_secret_here
HIPAA_ENCRYPTION_KEY=your_encryption_key_here
PORT=5000
NODE_ENV=development
EOF
    echo "📝 Created .env template. Please update with your actual API keys."
    echo ""
    read -p "Continue with template values? (y/n): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
else
    echo "✅ .env file found"
fi

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
    if [ $? -ne 0 ]; then
        echo "❌ Failed to install dependencies"
        exit 1
    fi
    echo "✅ Dependencies installed"
else
    echo "✅ Dependencies already installed"
fi

# Check if running in development or production
if [ "$NODE_ENV" = "production" ]; then
    echo "🚀 Starting in production mode..."
    npm start
else
    echo "🔧 Starting in development mode..."
    npm run dev
fi 