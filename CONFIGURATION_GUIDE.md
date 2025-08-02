# MediConnect AI - Configuration Guide

This guide will walk you through configuring all the necessary services and APIs to get your MediConnect AI platform fully operational.

## 📋 Prerequisites

Before you begin, ensure you have:
- Node.js 18+ installed
- MongoDB Atlas account or local MongoDB instance
- Redis instance (local or cloud)
- Google Cloud Platform account
- Email service provider account (Gmail, SendGrid, etc.)
- Twilio account (for SMS notifications)

## 🗂️ Configuration Checklist

### ✅ Backend Configuration
- [ ] MongoDB Database Setup
- [ ] Redis Cache Setup
- [ ] Google Gemini AI API
- [ ] Google Maps API
- [ ] Email Service Configuration
- [ ] Twilio SMS Service
- [ ] Environment Variables
- [ ] File Upload Directory
- [ ] Security Keys Generation

### ✅ Frontend Configuration
- [ ] Environment Variables
- [ ] API Base URL
- [ ] Google Maps Integration
- [ ] Service Worker (Optional)

---

## 🔧 Backend Configuration

### 1. MongoDB Database Setup

#### Option A: MongoDB Atlas (Recommended)
1. Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a free account and new cluster
3. Create a database user:
   - Go to Database Access → Add New Database User
   - Choose "Password" authentication
   - Username: `mediconnect-user`
   - Generate a secure password
   - Grant "Read and write to any database" role

4. Configure Network Access:
   - Go to Network Access → Add IP Address
   - For development: Add `0.0.0.0/0` (Allow access from anywhere)
   - For production: Add your server's specific IP

5. Get Connection String:
   - Go to Clusters → Connect → Connect your application
   - Copy the connection string (looks like):
   ```
   mongodb+srv://mediconnect-user:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```

#### Option B: Local MongoDB
```bash
# Install MongoDB locally
# macOS
brew install mongodb-community

# Ubuntu
sudo apt-get install mongodb

# Start MongoDB
mongod --dbpath /path/to/your/data/directory
```

### 2. Redis Setup

#### Option A: Redis Cloud (Recommended)
1. Go to [Redis Cloud](https://redis.com/redis-enterprise-cloud/)
2. Create a free account and database
3. Get connection details:
   - Endpoint: `redis-xxxxx.redislabs.com:port`
   - Password: Your Redis password
   - Connection URL: `redis://default:password@endpoint:port`

#### Option B: Local Redis
```bash
# Install Redis locally
# macOS
brew install redis

# Ubuntu
sudo apt-get install redis-server

# Start Redis
redis-server

# Connection URL for local Redis
redis://localhost:6379
```

### 3. Google Cloud Platform Setup

#### Enable Required APIs
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable the following APIs:
   - **Generative AI API** (for Gemini)
   - **Maps JavaScript API**
   - **Places API**
   - **Geocoding API**
   - **Distance Matrix API**

#### Get API Keys
1. Go to APIs & Services → Credentials
2. Click "Create Credentials" → "API Key"
3. Create separate keys for:
   - **Gemini AI API Key**: Restrict to Generative AI API
   - **Google Maps API Key**: Restrict to Maps, Places, Geocoding, Distance Matrix APIs

#### Configure API Key Restrictions
For **Gemini API Key**:
- Application restrictions: None (for development) or IP addresses (for production)
- API restrictions: Generative Language API

For **Google Maps API Key**:
- Application restrictions: HTTP referrers (for frontend) or IP addresses (for backend)
- API restrictions: Maps JavaScript API, Places API, Geocoding API, Distance Matrix API

### 4. Email Service Configuration

#### Option A: Gmail SMTP
1. Enable 2-Factor Authentication on your Gmail account
2. Generate an App Password:
   - Go to Google Account Settings → Security → 2-Step Verification → App passwords
   - Generate password for "Mail"
3. Use these settings:
   ```
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASS=your-app-password
   ```

#### Option B: SendGrid (Recommended for Production)
1. Sign up at [SendGrid](https://sendgrid.com/)
2. Create an API key
3. Use these settings:
   ```
   EMAIL_HOST=smtp.sendgrid.net
   EMAIL_PORT=587
   EMAIL_USER=apikey
   EMAIL_PASS=your-sendgrid-api-key
   ```

### 5. Twilio SMS Service
1. Sign up at [Twilio](https://www.twilio.com/)
2. Get your Account SID and Auth Token from the dashboard
3. Purchase a phone number or use the trial number
4. Configuration:
   ```
   TWILIO_ACCOUNT_SID=your-account-sid
   TWILIO_AUTH_TOKEN=your-auth-token
   TWILIO_PHONE_NUMBER=+1234567890
   ```

### 6. Generate Security Keys

#### JWT Secret Keys
```bash
# Generate strong random keys
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

#### Encryption Key (for HIPAA compliance)
```bash
# Generate AES-256 key
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 7. Backend Environment Variables

Create `backend/.env` file:

```env
# Server Configuration
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173

# Database Configuration
MONGODB_URI=mongodb+srv://mediconnect-user:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/mediconnect?retryWrites=true&w=majority
REDIS_URL=redis://default:YOUR_PASSWORD@redis-xxxxx.redislabs.com:port

# JWT Configuration
JWT_SECRET=your-generated-jwt-secret-key
JWT_EXPIRES_IN=7d
JWT_REFRESH_SECRET=your-generated-refresh-secret-key
JWT_REFRESH_EXPIRES_IN=30d

# Encryption (HIPAA Compliance)
ENCRYPTION_KEY=your-generated-encryption-key

# Google APIs
GOOGLE_MAPS_API_KEY=your-google-maps-api-key
GEMINI_API_KEY=your-gemini-api-key

# Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# SMS Configuration
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
```

### 8. Create Upload Directory
```bash
cd backend
mkdir -p uploads/photos
chmod 755 uploads/photos
```

---

## 🎨 Frontend Configuration

### 1. Frontend Environment Variables

Create `.env` file in your project root:

```env
# API Configuration
VITE_API_BASE_URL=http://localhost:5000/api
VITE_BACKEND_URL=http://localhost:5000

# Google APIs
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
```

---

## 🚀 Installation and Startup

### Backend Setup
```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Start development server
npm run dev

# Or start production server
npm run build
npm start
```

### Frontend Setup
```bash
# Navigate to frontend directory (project root)
npm install

# Start development server
npm run dev

# Or build for production
npm run build
npm run preview
```

---

## 🧪 Testing Your Configuration

### 1. Test Backend Health
```bash
curl http://localhost:5000/api/health
```

Expected response:
```json
{
  "status": "OK",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "uptime": 123.456
}
```

### 2. Test Database Connection
Check your backend console for:
```
✅ MongoDB connected successfully
✅ Redis connected successfully
```

### 3. Test Frontend Access
Navigate to `http://localhost:5173` and verify:
- [ ] Homepage loads correctly
- [ ] Symptom form is accessible
- [ ] Photo upload functionality works
- [ ] Maps integration works (if configured)

### 4. Test API Integration
1. Fill out the symptom form
2. Submit with photos
3. Check browser network tab for successful API calls
4. Verify triage results display correctly

---

## 🔒 Security Considerations

### For Development
- Use strong, unique passwords for all services
- Keep API keys secure and never commit them to version control
- Use HTTPS in production
- Regularly rotate API keys and passwords

### For Production
- Use environment-specific API keys
- Implement IP restrictions on API keys
- Use secure Redis configuration with authentication
- Enable MongoDB authentication
- Use HTTPS everywhere
- Implement proper CORS policies
- Add rate limiting
- Enable audit logging
- Regular security updates

---

## 🐛 Common Issues and Solutions

### Backend Issues

**MongoDB Connection Error**
```
Error: Could not connect to MongoDB
```
Solution:
- Check your MongoDB URI format
- Verify network access in MongoDB Atlas
- Ensure correct username/password

**Redis Connection Error**
```
Error: Redis connection failed
```
Solution:
- Verify Redis URL format
- Check Redis service is running
- Confirm authentication credentials

**Gemini API Error**
```
Error: Failed to analyze symptoms with AI
```
Solution:
- Verify Gemini API key is correct
- Check API is enabled in Google Cloud Console
- Ensure sufficient API quota

### Frontend Issues

**API Connection Error**
```
Network Error: Failed to fetch
```
Solution:
- Verify backend is running on correct port
- Check VITE_API_BASE_URL in .env
- Ensure CORS is configured correctly

**Google Maps Not Loading**
```
Google Maps JavaScript API error
```
Solution:
- Verify Google Maps API key
- Check API is enabled in Google Cloud Console
- Ensure correct API restrictions

---

## 📚 Additional Resources

- [MongoDB Atlas Documentation](https://docs.atlas.mongodb.com/)
- [Redis Documentation](https://redis.io/documentation)
- [Google Cloud API Documentation](https://cloud.google.com/docs)
- [Twilio Documentation](https://www.twilio.com/docs)
- [SendGrid Documentation](https://docs.sendgrid.com/)

---

## 🆘 Support

If you encounter issues:
1. Check the console logs for detailed error messages
2. Verify all environment variables are set correctly
3. Ensure all required services are running
4. Check API quotas and rate limits
5. Review the troubleshooting section above

Your MediConnect AI platform should now be fully configured and operational! 🎉