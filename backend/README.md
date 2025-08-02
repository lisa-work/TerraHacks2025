s 
# Healthcare App Backend

A comprehensive backend for a healthcare application with AI triage, real-time notifications, and HIPAA-compliant data encryption.

## Features

- 🔐 **HIPAA-Compliant Security**: Encrypted sensitive medical data
- 🤖 **AI-Powered Triage**: Gemini AI integration for symptom analysis
- 📍 **Location Services**: Google Maps integration for healthcare facility search
- ⚡ **Real-Time Updates**: WebSocket notifications for live updates
- 👥 **Multi-User Support**: Patients, doctors, nurses, and admins
- 📱 **RESTful API**: Comprehensive API endpoints
- 🔄 **Appointment Management**: Full appointment lifecycle
- 🏥 **Clinic Management**: Healthcare facility management

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose
- **Cache**: Redis
- **Real-time**: Socket.io
- **AI**: Google Gemini AI
- **Maps**: Google Maps API
- **Security**: JWT, bcrypt, encryption
- **Validation**: express-validator

## Prerequisites

- Node.js (v16 or higher)
- MongoDB (v4.4 or higher)
- Redis (v6 or higher)
- Google Gemini AI API Key
- Google Maps API Key

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

3. **Set up environment variables**
   Create a `.env` file in the backend directory:
   ```env
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
   ```

4. **Start the services**
   ```bash
   # Start MongoDB (if not running)
   mongod

   # Start Redis (if not running)
   redis-server

   # Start the backend server
   npm start

   # For development with auto-restart
   npm run dev
   ```

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `POST /api/auth/oauth/callback` - OAuth callback
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update user profile
- `POST /api/auth/refresh` - Refresh JWT token
- `POST /api/auth/logout` - User logout
- `GET /api/auth/verify` - Verify token
- `POST /api/auth/change-password` - Change password

### Appointments

- `POST /api/booking/create` - Create appointment with AI triage
- `GET /api/booking/my-appointments` - Get user's appointments
- `GET /api/booking/:appointmentId` - Get specific appointment
- `PATCH /api/booking/:appointmentId/status` - Update appointment status
- `POST /api/booking/:appointmentId/cancel` - Cancel appointment
- `POST /api/booking/:appointmentId/reschedule` - Reschedule appointment
- `POST /api/booking/:appointmentId/notes` - Add medical notes
- `GET /api/booking/available-slots/:doctorId` - Get available time slots
- `GET /api/booking/search-doctors` - Search doctors

### User Management

- `GET /api/user/profile` - Get user profile
- `PUT /api/user/profile` - Update user profile
- `PUT /api/user/medical-info` - Update medical information
- `PUT /api/user/insurance` - Update insurance information
- `PUT /api/user/provider-info` - Update provider information
- `GET /api/user/search` - Search users (admin only)
- `GET /api/user/:userId` - Get user by ID (admin only)
- `PATCH /api/user/:userId/status` - Update user status (admin only)
- `GET /api/user/stats/overview` - Get user statistics (admin only)
- `GET /api/user/stats/activity` - Get user activity (admin only)
- `DELETE /api/user/:userId` - Delete user (admin only)

### AI Services

- `POST /api/ai/triage` - AI triage assessment
- `POST /api/ai/medical-advice` - Get medical advice
- `POST /api/ai/analyze-symptoms` - Analyze symptoms
- `POST /api/ai/emergency-assessment` - Emergency assessment
- `POST /api/ai/medication-info` - Get medication information
- `POST /api/ai/health-recommendations` - Get health recommendations
- `POST /api/ai/emergency-services` - Find emergency services
- `POST /api/ai/health-summary` - Generate health summary
- `POST /api/ai/diagnosis-suggestions` - Get diagnosis suggestions
- `POST /api/ai/treatment-recommendations` - Get treatment recommendations

### Health Check

- `GET /api/health` - Server health check

## Database Models

### User Model
- Authentication (Auth0, Clerk, Firebase, Local)
- User types (patient, doctor, nurse, admin, clinic_staff)
- HIPAA-encrypted personal information
- Medical information (encrypted)
- Insurance information (encrypted)
- Provider information (for healthcare workers)
- Preferences and settings

### Appointment Model
- Appointment scheduling and management
- AI triage integration
- Status tracking and history
- Medical notes and prescriptions
- Insurance and billing
- Real-time updates

### Clinic Model
- Healthcare facility information
- Operating hours and services
- Staff and capacity management
- Quality metrics
- Location and contact information

## WebSocket Events

### Client to Server
- `appointment_update` - Update appointment status
- `appointment_created` - Notify new appointment
- `emergency_alert` - Send emergency alert
- `chat_message` - Send chat message
- `typing` - Typing indicator
- `status_update` - Update user status
- `join_appointment_room` - Join appointment room
- `leave_appointment_room` - Leave appointment room
- `ping` - Connection health check

### Server to Client
- `connected` - Connection confirmation
- `notification` - General notifications
- `appointment_updated` - Appointment update
- `emergency_alert` - Emergency notifications
- `chat_message` - Chat messages
- `typing` - Typing indicators
- `doctor_status` - Doctor status updates
- `joined_room` - Room join confirmation
- `left_room` - Room leave confirmation
- `pong` - Connection health response
- `error` - Error messages

## Security Features

- **HIPAA Compliance**: All sensitive medical data is encrypted
- **JWT Authentication**: Secure token-based authentication
- **Rate Limiting**: API rate limiting to prevent abuse
- **Input Validation**: Comprehensive request validation
- **CORS Protection**: Cross-origin resource sharing protection
- **Helmet Security**: Security headers middleware
- **Password Hashing**: bcrypt for password security

## AI Integration

### Gemini AI Features
- **Symptom Triage**: Analyze symptoms and assess urgency
- **Medical Advice**: Provide general medical information
- **Diagnosis Suggestions**: Suggest possible diagnoses
- **Treatment Recommendations**: Recommend treatments
- **Medication Information**: Provide medication details
- **Health Recommendations**: Personalized health advice

### Safety Measures
- Medical disclaimers on all AI responses
- Emphasis on consulting healthcare professionals
- Clear limitations of AI advice
- Emergency warnings when appropriate

## Google Maps Integration

### Location Services
- **Geocoding**: Convert addresses to coordinates
- **Reverse Geocoding**: Convert coordinates to addresses
- **Nearby Healthcare**: Find nearby healthcare facilities
- **Place Details**: Get detailed facility information
- **Distance Calculation**: Calculate travel distances
- **Directions**: Get travel directions
- **Healthcare Search**: Search for specific healthcare services

## Development

### Running in Development Mode
```bash
npm run dev
```

### Running Tests
```bash
npm test
```

### Code Structure
```
backend/
├── models/          # Database models
├── routes/          # API routes
├── services/        # Business logic services
├── sockets/         # WebSocket handlers
├── middleware/      # Custom middleware
├── utils/           # Utility functions
├── server.js        # Main server file
├── package.json     # Dependencies
└── README.md        # This file
```

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `VITE_GEMINI_API_KEY` | Google Gemini AI API key | Yes |
| `VITE_GOOGLE_MAPS_API_KEY` | Google Maps API key | Yes |
| `DB_URI` | MongoDB connection string | Yes |
| `REDIS_URL` | Redis connection string | Yes |
| `JWT_SECRET` | JWT signing secret | Yes |
| `HIPAA_ENCRYPTION_KEY` | Encryption key for HIPAA data | Yes |
| `AUTH_PROVIDER` | Authentication provider | No |
| `PORT` | Server port | No |
| `NODE_ENV` | Environment mode | No |

## API Response Format

### Success Response
```json
{
  "message": "Operation successful",
  "data": { ... },
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### Error Response
```json
{
  "error": "Error message",
  "message": "Detailed error description",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

For support and questions, please contact the development team or create an issue in the repository. 