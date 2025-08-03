# MediConnect AI - Complete Setup Guide

This guide will help you set up the complete MediConnect AI healthcare booking and navigation platform, including both frontend and backend components.

## 🏗️ Project Overview

MediConnect AI is a comprehensive healthcare platform that includes:

- **Frontend**: React/TypeScript application with modern UI
- **Backend**: Node.js/Express API with MongoDB and Redis
- **AI Integration**: Gemini AI for symptom triage
- **Maps Integration**: Google Maps for location services
- **Medical History**: HIPAA-compliant data management

## 📋 Prerequisites

Before starting, ensure you have the following installed:

- **Node.js** (v18 or higher)
- **MongoDB** (v5.0 or higher)
- **Redis** (v6.0 or higher)
- **Git**

### External Services Required:

1. **Google Cloud Platform Account**
   - Gemini AI API access
   - Google Maps API key

2. **Email Service** (for notifications)
   - Gmail with App Password, or
   - SMTP service provider

3. **SMS Service** (optional, for SMS notifications)
   - Twilio account

## 🚀 Quick Start

### 1. Clone and Setup Backend

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Copy environment file
cp .env.example .env
```

### 2. Configure Backend Environment

Edit `backend/.env` with your configuration:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/mediconnect
REDIS_URL=redis://localhost:6379

# JWT Configuration (Generate secure keys)
JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters
JWT_EXPIRES_IN=7d
JWT_REFRESH_SECRET=your-refresh-token-secret-minimum-32-characters
JWT_REFRESH_EXPIRES_IN=30d

# Encryption (32-character key)
ENCRYPTION_KEY=your-32-character-encryption-key-here

# Google Services
GOOGLE_MAPS_API_KEY=your-google-maps-api-key
GEMINI_API_KEY=your-gemini-api-key # Optional - backend falls back to stub responses if not provided

# Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# SMS Configuration (Optional)
TWILIO_ACCOUNT_SID=your-twilio-account-sid
TWILIO_AUTH_TOKEN=your-twilio-auth-token
TWILIO_PHONE_NUMBER=+1234567890

# Security
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# CORS
FRONTEND_URL=http://localhost:5173
```

### 3. Configure Frontend Environment

Edit `.env` in the root directory:

```env
# API Configuration
VITE_API_BASE_URL=http://localhost:5000/api
VITE_BACKEND_URL=http://localhost:5000

# Google Services API Keys
VITE_GOOGLE_MAPS_API_KEY=your-google-maps-api-key-here
VITE_GEMINI_API_KEY=your-gemini-api-key-here # Optional

# App Configuration
VITE_APP_NAME=MediConnect AI
VITE_APP_VERSION=1.0.0

# Environment
VITE_NODE_ENV=development

# WebSocket Configuration
VITE_WEBSOCKET_URL=ws://localhost:5000

# Feature Flags
VITE_ENABLE_VOICE_INPUT=true
VITE_ENABLE_PUSH_NOTIFICATIONS=true
VITE_ENABLE_GEOLOCATION=true
```

### 4. Start Services

**Terminal 1 - Start MongoDB:**
```bash
# On macOS with Homebrew
brew services start mongodb/brew/mongodb-community

# On Ubuntu/Debian
sudo systemctl start mongod

# On Windows
net start MongoDB
```

**Terminal 2 - Start Redis:**
```bash
# On macOS with Homebrew
brew services start redis

# On Ubuntu/Debian
sudo systemctl start redis-server

# On Windows
redis-server
```

**Terminal 3 - Start Backend:**
```bash
cd backend
npm run dev
```

**Terminal 4 - Start Frontend:**
```bash
# From project root
npm run dev
```

## 🔧 Detailed Configuration

### Google Cloud Platform Setup

1. **Create a GCP Project**
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select existing one

2. **Enable APIs**
   - Enable Gemini AI API
   - Enable Maps JavaScript API
   - Enable Geocoding API
   - Enable Places API

3. **Create API Keys**
   - Go to APIs & Services > Credentials
   - Create API key for Maps services
   - Create API key for Gemini AI
   - Restrict keys to specific APIs for security

### Database Setup

**MongoDB:**
```bash
# Connect to MongoDB
mongosh

# Create database and user
use mediconnect
db.createUser({
  user: "mediconnect_user",
  pwd: "secure_password",
  roles: [{ role: "readWrite", db: "mediconnect" }]
})
```

**Redis:**
```bash
# Test Redis connection
redis-cli ping
# Should return: PONG
```

### Email Configuration

**Gmail Setup:**
1. Enable 2-Factor Authentication
2. Generate App Password
3. Use App Password in EMAIL_PASS environment variable

**SMTP Alternative:**
- Use services like SendGrid, Mailgun, or AWS SES
- Update EMAIL_HOST, EMAIL_PORT, EMAIL_USER, EMAIL_PASS accordingly

## 📱 Frontend Integration

The frontend is already configured to work with the backend. Key integration points:

### API Client Setup

The frontend should automatically connect to the backend using the environment variables. The main integration points are:

1. **Authentication**: JWT tokens for user sessions
2. **Triage System**: AI-powered symptom analysis
3. **Clinic Search**: Location-based healthcare provider search
4. **Medical History**: Secure medical data management
5. **Real-time Updates**: WebSocket connections for notifications

### User Context Updates

The existing `UserContext` will now connect to real backend APIs instead of mock data. The medical history functionality has been added to the user settings.

## 🔒 Security Considerations

### Environment Variables Security

- Never commit `.env` files to version control
- Use strong, unique keys for JWT secrets
- Generate a secure 32-character encryption key
- Rotate API keys regularly

### HIPAA Compliance

The backend includes HIPAA-compliant features:
- Data encryption for sensitive medical information
- Secure authentication and authorization
- Audit logging capabilities
- Data access controls

### Production Security

For production deployment:
- Use HTTPS/SSL certificates
- Configure proper CORS origins
- Set up rate limiting
- Enable security headers
- Use environment-specific database credentials

## 🧪 Testing the Setup

### Backend Health Check
```bash
curl http://localhost:5000/api/health
```

Expected response:
```json
{
  "status": "OK",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "uptime": 123.456
}
```

### Frontend Access
- Open http://localhost:5173 in your browser
- You should see the MediConnect AI landing page
- Try registering a new user account
- Test the symptom triage functionality

### Database Verification
```bash
# Check MongoDB connection
mongosh mediconnect --eval "db.stats()"

# Check Redis connection
redis-cli info server
```

## 🐛 Troubleshooting

### Common Issues

**Port Already in Use:**
```bash
# Kill process on port 5000
lsof -ti:5000 | xargs kill -9

# Kill process on port 5173
lsof -ti:5173 | xargs kill -9
```

**MongoDB Connection Issues:**
- Ensure MongoDB is running
- Check connection string in .env
- Verify database permissions

**Redis Connection Issues:**
- Ensure Redis server is running
- Check Redis URL in .env
- Test with `redis-cli ping`

**API Key Issues:**
- Verify API keys are correctly set in both frontend and backend .env files
- Check API key restrictions in Google Cloud Console
- Ensure APIs are enabled in GCP

**CORS Issues:**
- Verify FRONTEND_URL matches your frontend URL
- Check browser developer console for CORS errors

## 📊 Monitoring and Logs

### Backend Logs
The backend uses Morgan for HTTP request logging and console logging for application events.

### Frontend Development
Use browser developer tools to monitor:
- Network requests to backend APIs
- Console logs for application events
- Local storage for user session data

## 🚀 Production Deployment

### Backend Deployment
1. Build the application: `npm run build`
2. Set production environment variables
3. Use PM2 for process management
4. Configure reverse proxy (Nginx)
5. Set up SSL certificates

### Frontend Deployment
1. Build the application: `npm run build`
2. Deploy to static hosting (Vercel, Netlify, etc.)
3. Update API URLs for production backend

### Database Production Setup
- Use MongoDB Atlas for managed database
- Use Redis Cloud for managed Redis
- Configure proper backup strategies
- Set up monitoring and alerts

## 📝 Next Steps

After successful setup:

1. **Customize the Application**
   - Add your branding and styling
   - Configure additional features
   - Set up analytics and monitoring

2. **Add Sample Data**
   - Create sample clinics in the database
   - Test with various user scenarios
   - Populate with real healthcare provider data

3. **Integrate Additional Services**
   - Set up push notifications
   - Configure SMS notifications
   - Add payment processing
   - Implement appointment booking with real healthcare systems

4. **Testing and Quality Assurance**
   - Write comprehensive tests
   - Perform security audits
   - Test with real user scenarios
   - Validate HIPAA compliance requirements

## 🆘 Support

If you encounter issues during setup:

1. Check the troubleshooting section above
2. Review the backend README.md for detailed API documentation
3. Verify all environment variables are correctly set
4. Check that all required services (MongoDB, Redis) are running
5. Review application logs for specific error messages

For additional support, please refer to the project documentation or contact the development team.