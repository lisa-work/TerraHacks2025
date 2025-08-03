# MediConnect AI Backend

A comprehensive Node.js/Express backend for the MediConnect AI healthcare booking and navigation platform.

## Features

- 🔐 **JWT Authentication** with bcryptjs password hashing
- 🤖 **Gemini AI Integration** for symptom triage and medical recommendations
- 🗺️ **Google Maps API** for location services and geocoding
- 🏥 **Clinic Search & Filtering** with advanced query capabilities
- 📱 **Medical History Management** with HIPAA-compliant encryption
- ⚡ **Redis Caching** for improved performance
- 🔒 **Security Features** including rate limiting and data encryption
- 📡 **WebSocket Support** for real-time updates
- 📊 **MongoDB Database** with comprehensive schemas

## Prerequisites

- Node.js (v18 or higher)
- MongoDB (v5.0 or higher)
- Redis (v6.0 or higher)
- Google Cloud Platform account (for Gemini AI and Maps APIs)

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   cp .env.example .env
   ```
   
   Fill in the required environment variables in `.env`:

   ```env
   # Server Configuration
   PORT=5000
   NODE_ENV=development
   
   # Database
   MONGODB_URI=mongodb://localhost:27017/mediconnect
   REDIS_URL=redis://localhost:6379
   
   # JWT Configuration
   JWT_SECRET=your-super-secret-jwt-key-here
   JWT_EXPIRES_IN=7d
   JWT_REFRESH_SECRET=your-refresh-token-secret
   JWT_REFRESH_EXPIRES_IN=30d
   
   # Encryption
   ENCRYPTION_KEY=your-32-character-encryption-key
   
   # Google Services
   GOOGLE_MAPS_API_KEY=your-google-maps-api-key
   GEMINI_API_KEY=your-gemini-api-key # Optional - backend uses fallback responses if unset
   
   # Email Configuration
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASS=your-app-password
   
   # SMS Configuration (Twilio)
   TWILIO_ACCOUNT_SID=your-twilio-account-sid
   TWILIO_AUTH_TOKEN=your-twilio-auth-token
   TWILIO_PHONE_NUMBER=+1234567890
   
   # Frontend URL
   FRONTEND_URL=http://localhost:5173
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

## API Documentation

### Authentication Endpoints

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/verify-email` - Verify email address
- `POST /api/auth/forgot-password` - Request password reset
- `PUT /api/auth/reset-password` - Reset password
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - Logout user
- `POST /api/auth/refresh-token` - Refresh access token

### User Management

- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile
- `DELETE /api/users/profile` - Delete user account

### Medical History

- `GET /api/medical-history` - Get medical history
- `PUT /api/medical-history` - Update medical history
- `POST /api/medical-history/allergies` - Add allergy
- `DELETE /api/medical-history/allergies/:allergy` - Remove allergy
- `POST /api/medical-history/medications` - Add medication
- `PUT /api/medical-history/medications/:id` - Update medication
- `DELETE /api/medical-history/medications/:id` - Remove medication
- `POST /api/medical-history/conditions` - Add condition
- `PUT /api/medical-history/conditions/:id` - Update condition
- `DELETE /api/medical-history/conditions/:id` - Remove condition

### Clinic Search

- `GET /api/clinics/search` - Search clinics with filters
- `GET /api/clinics/nearby` - Get nearby clinics
- `GET /api/clinics/specialties` - Get available specialties
- `GET /api/clinics/insurance-providers` - Get insurance providers
- `GET /api/clinics/:id` - Get clinic details
- `GET /api/clinics/:id/availability` - Get clinic availability

### AI Triage

- `POST /api/triage/start` - Start new triage session
- `GET /api/triage/session/:sessionId` - Get triage results
- `POST /api/triage/session/:sessionId/feedback` - Submit feedback
- `GET /api/triage/history` - Get user's triage history

### Health Check

- `GET /api/health` - Server health status

## Database Schema

### User Model
- Personal information (name, email, phone, etc.)
- Location data
- Insurance information
- Comprehensive medical history
- User preferences and settings

### Clinic Model
- Basic information (name, address, contact)
- Location coordinates
- Operating hours
- Services and specialties
- Insurance acceptance
- Staff information
- Pricing and wait times

### Appointment Model
- User and clinic references
- Date and time information
- Appointment type and status
- Cost and insurance details
- Prescriptions and follow-ups

### Triage Session Model
- Symptom analysis data
- AI recommendations
- Confidence scores
- User feedback

## Security Features

- **JWT Authentication** with secure token management
- **Password Hashing** using bcryptjs with salt rounds
- **Rate Limiting** to prevent abuse
- **CORS Protection** with configurable origins
- **Helmet.js** for security headers
- **Data Encryption** for sensitive medical information
- **Input Validation** using express-validator
- **HIPAA Compliance** considerations

## Development

### Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint issues
- `npm test` - Run tests

### Project Structure

```
src/
├── config/          # Database and Redis configuration
├── controllers/     # Route controllers
├── middleware/      # Custom middleware
├── models/          # MongoDB schemas
├── routes/          # API routes
├── services/        # External service integrations
├── utils/           # Utility functions
└── server.ts        # Main server file
```

## Production Deployment

1. **Environment Setup**
   - Set `NODE_ENV=production`
   - Configure production database URLs
   - Set up proper SSL certificates
   - Configure environment-specific API keys

2. **Build the application**
   ```bash
   npm run build
   ```

3. **Start the production server**
   ```bash
   npm start
   ```

4. **Process Management**
   Consider using PM2 for production:
   ```bash
   npm install -g pm2
   pm2 start dist/server.js --name "mediconnect-backend"
   ```

## API Integration Examples

### Frontend Integration

```javascript
// API client setup
const API_BASE_URL = 'http://localhost:5000/api';

// Authentication
const login = async (email, password) => {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  });
  return response.json();
};

// Triage session
const startTriage = async (symptomData) => {
  const response = await fetch(`${API_BASE_URL}/triage/start`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(symptomData),
  });
  return response.json();
};
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Run linting and tests
6. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support and questions, please contact the development team or create an issue in the repository.