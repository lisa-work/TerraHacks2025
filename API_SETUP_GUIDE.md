# MediConnect AI - API Setup Guide

This guide will help you set up all the necessary API keys and configurations to make MediConnect AI fully functional for real-world deployment.

## Required API Keys and Services

### 1. Google Gemini AI API (REQUIRED for AI Features)

**Purpose**: Powers image analysis, insurance matching, and enhanced symptom triage.

**Setup Steps**:
1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the generated API key
5. Add to your backend `.env` file:
   ```
   GEMINI_API_KEY=your_gemini_api_key_here
   ```

**Features Enabled**:
- Medical image analysis with AI
- Intelligent insurance provider matching
- Enhanced symptom assessment
- Real-time health recommendations

**Cost**: Free tier includes 60 requests per minute. Paid plans start at $0.50 per 1M characters.

### 2. Google Maps API (REQUIRED for Location Services)

**Purpose**: Healthcare provider location search, distance calculations, and address geocoding.

**Setup Steps**:
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable the following APIs:
   - Maps JavaScript API
   - Places API
   - Geocoding API
   - Distance Matrix API
4. Go to "Credentials" → "Create Credentials" → "API Key"
5. Restrict the API key to your domain (recommended for security)
6. Add to your backend `.env` file:
   ```
   GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here
   ```

**Features Enabled**:
- Real healthcare provider search by location
- Distance and travel time calculations  
- Address validation and geocoding
- Interactive maps in the UI

**Cost**: $200 free credit monthly. Pay-as-you-go after that.

### 3. MongoDB Database (REQUIRED)

**Purpose**: Store all user data, appointments, medical history, and application data.

**Setup Options**:

#### Option A: MongoDB Atlas (Cloud - Recommended)
1. Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a free account
3. Create a new cluster (free tier available)
4. Create a database user
5. Whitelist your IP address (or use 0.0.0.0/0 for development)
6. Get connection string from "Connect" → "Connect your application"
7. Add to your backend `.env` file:
   ```
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/mediconnect?retryWrites=true&w=majority
   ```

#### Option B: Local MongoDB
1. Install MongoDB Community Edition
2. Start MongoDB service
3. Add to your backend `.env` file:
   ```
   MONGODB_URI=mongodb://localhost:27017/mediconnect
   ```

**Features Enabled**:
- User authentication and profiles
- Medical history storage
- Appointment management
- Insurance provider database
- Image metadata storage

**Cost**: MongoDB Atlas free tier includes 512MB storage. Paid plans start at $9/month.

### 4. Email Service (REQUIRED for Notifications)

**Purpose**: Send appointment confirmations, reminders, and verification emails.

**Setup Options**:

#### Option A: Gmail SMTP (Easiest for Development)
1. Enable 2-factor authentication on your Gmail account
2. Generate an app password: [App Passwords](https://myaccount.google.com/apppasswords)
3. Add to your backend `.env` file:
   ```
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASS=your-app-password
   EMAIL_FROM=your-email@gmail.com
   ```

#### Option B: SendGrid (Recommended for Production)
1. Sign up at [SendGrid](https://sendgrid.com/)
2. Create an API key
3. Add to your backend `.env` file:
   ```
   SENDGRID_API_KEY=your_sendgrid_api_key
   EMAIL_FROM=noreply@yourdomain.com
   ```

#### Option C: AWS SES (Enterprise)
1. Set up AWS SES in your AWS console
2. Verify your domain/email
3. Add to your backend `.env` file:
   ```
   AWS_ACCESS_KEY_ID=your_access_key
   AWS_SECRET_ACCESS_KEY=your_secret_key
   AWS_REGION=us-east-1
   EMAIL_FROM=noreply@yourdomain.com
   ```

**Features Enabled**:
- Email verification for new accounts
- Appointment confirmation emails
- Appointment reminder notifications
- Password reset emails

### 5. Redis (OPTIONAL but Recommended)

**Purpose**: Caching, session management, and rate limiting.

**Setup Options**:

#### Option A: Redis Cloud (Recommended)
1. Sign up at [Redis Cloud](https://redis.com/try-free/)
2. Create a free database
3. Get connection details
4. Add to your backend `.env` file:
   ```
   REDIS_URL=redis://username:password@host:port
   ```

#### Option B: Local Redis
1. Install Redis locally
2. Start Redis server
3. Add to your backend `.env` file:
   ```
   REDIS_URL=redis://localhost:6379
   ```

**Features Enabled**:
- Improved performance through caching
- Session management
- Rate limiting protection
- Real-time features

**Cost**: Redis Cloud free tier includes 30MB. Paid plans start at $5/month.

## Complete Backend .env File Template

Create a `.env` file in your `backend/` directory with the following:

```env
# Server Configuration
NODE_ENV=development
PORT=5000
FRONTEND_URL=http://localhost:5173

# Database
MONGODB_URI=your_mongodb_connection_string

# JWT Configuration  
JWT_SECRET=your_super_secret_jwt_key_here_make_it_long_and_random
JWT_EXPIRE=30d
JWT_COOKIE_EXPIRE=30

# Google APIs
GEMINI_API_KEY=your_gemini_api_key_here
GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here

# Email Configuration (Choose one option)
# Option A: Gmail SMTP
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
EMAIL_FROM=your-email@gmail.com

# Option B: SendGrid
# SENDGRID_API_KEY=your_sendgrid_api_key
# EMAIL_FROM=noreply@yourdomain.com

# Redis (Optional)
REDIS_URL=redis://localhost:6379

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# File Upload
MAX_FILE_SIZE=10485760
UPLOAD_PATH=uploads/
```

## Frontend Environment Variables

Create a `.env` file in your project root (frontend) with:

```env
VITE_API_BASE_URL=http://localhost:5000/api
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here
```

## Security Considerations

### For Development:
- Use the provided default values
- Ensure `.env` files are in `.gitignore`
- Use strong, unique passwords

### For Production:
1. **JWT Secret**: Generate a strong, random secret:
   ```bash
   node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
   ```

2. **Database Security**:
   - Use MongoDB Atlas with IP whitelisting
   - Create dedicated database users with minimal permissions
   - Enable database encryption

3. **API Key Security**:
   - Restrict Google Maps API key to your domain
   - Use environment variables, never hardcode keys
   - Rotate keys regularly

4. **HTTPS**:
   - Always use HTTPS in production
   - Update FRONTEND_URL to use https://

5. **CORS Configuration**:
   - Update FRONTEND_URL to your production domain
   - Never use wildcard (*) for CORS in production

## Installation Steps

1. **Backend Setup**:
   ```bash
   cd backend
   npm install
   # Create .env file with your API keys
   npm run dev
   ```

2. **Frontend Setup**:
   ```bash
   npm install
   # Create .env file with your configuration
   npm run dev
   ```

3. **Database Initialization**:
   - The application will automatically create necessary collections
   - Sample insurance providers will be seeded on first run

## Testing Your Setup

1. **Authentication**: Try registering a new account
2. **Email**: Check if verification emails are sent
3. **Location Services**: Search for healthcare providers
4. **AI Features**: Upload a medical image and check analysis
5. **Insurance Search**: Search for insurance providers

## Troubleshooting

### Common Issues:

1. **MongoDB Connection Failed**:
   - Check your connection string
   - Verify IP whitelist settings
   - Ensure database user has correct permissions

2. **Google Maps Not Loading**:
   - Verify API key is correct
   - Check if required APIs are enabled
   - Ensure billing is set up (required even for free tier)

3. **Email Not Sending**:
   - Check SMTP credentials
   - Verify app password for Gmail
   - Check spam folder

4. **AI Features Not Working**:
   - Verify Gemini API key
   - Check API quota limits
   - Ensure image files are being uploaded correctly

5. **CORS Errors**:
   - Verify FRONTEND_URL matches your development server
   - Check if both frontend and backend are running

## Support

If you encounter issues:
1. Check the console logs for specific error messages
2. Verify all environment variables are set correctly
3. Ensure all required services are running
4. Check API quotas and billing status

## Cost Estimation (Monthly)

**Free Tier (Development)**:
- MongoDB Atlas: Free (512MB)
- Google Maps: Free ($200 credit)
- Gemini AI: Free (60 req/min)
- Redis Cloud: Free (30MB)
- Total: $0/month

**Production (Small Scale)**:
- MongoDB Atlas: $9/month
- Google Maps: ~$50/month (moderate usage)
- Gemini AI: ~$20/month
- Redis Cloud: $5/month
- SendGrid: Free (100 emails/day)
- Total: ~$84/month

**Production (Medium Scale)**:
- MongoDB Atlas: $57/month
- Google Maps: ~$200/month
- Gemini AI: ~$100/month
- Redis Cloud: $15/month
- SendGrid: $15/month
- Total: ~$387/month