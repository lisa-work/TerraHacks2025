"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.io = void 0;
require("./config/env");
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const compression_1 = __importDefault(require("compression"));
const morgan_1 = __importDefault(require("morgan"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const http_1 = require("http");
const socket_io_1 = require("socket.io");
const database_1 = require("./config/database");
const redis_1 = require("./config/redis");
const errorHandler_1 = require("./middleware/errorHandler");
const notFoundHandler_1 = require("./middleware/notFoundHandler");
const seedData_1 = require("./utils/seedData");
const auth_1 = __importDefault(require("./routes/auth"));
const user_1 = __importDefault(require("./routes/user"));
const clinic_1 = __importDefault(require("./routes/clinic"));
const appointment_1 = __importDefault(require("./routes/appointment"));
const triage_1 = __importDefault(require("./routes/triage"));
const medicalHistory_1 = __importDefault(require("./routes/medicalHistory"));
const notification_1 = __importDefault(require("./routes/notification"));
const insurance_1 = __importDefault(require("./routes/insurance"));
const upload_1 = __importDefault(require("./routes/upload"));
const location_1 = __importDefault(require("./routes/location"));
const googleMapsApiKey = process.env.GOOGLE_MAPS_API_KEY;
if (googleMapsApiKey) {
    console.log('✅ GOOGLE_MAPS_API_KEY loaded');
}
else {
    console.warn('GOOGLE_MAPS_API_KEY environment variable is not set. Maps features will be disabled.');
}
const app = (0, express_1.default)();
const server = (0, http_1.createServer)(app);
const io = new socket_io_1.Server(server, {
    cors: {
        origin: process.env.FRONTEND_URL || "http://localhost:5173",
        methods: ["GET", "POST"]
    }
});
exports.io = io;
const PORT = process.env.PORT || 5000;
const limiter = (0, express_rate_limit_1.default)({
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'),
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),
    message: 'Too many requests from this IP, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
});
app.use((0, helmet_1.default)());
app.use((0, compression_1.default)());
app.use((0, morgan_1.default)('combined'));
app.use(limiter);
app.use((0, cors_1.default)({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true
}));
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true, limit: '10mb' }));
app.get('/api/health', (req, res) => {
    res.status(200).json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
});
app.use('/api/auth', auth_1.default);
app.use('/api/users', user_1.default);
app.use('/api/clinics', clinic_1.default);
app.use('/api/appointments', appointment_1.default);
app.use('/api/triage', triage_1.default);
app.use('/api/medical-history', medicalHistory_1.default);
app.use('/api/notifications', notification_1.default);
app.use('/api/insurance', insurance_1.default);
app.use('/api/upload', upload_1.default);
app.use('/api/location', location_1.default);
io.on('connection', (socket) => {
    console.log('User connected:', socket.id);
    socket.on('join-user-room', (userId) => {
        socket.join(`user_${userId}`);
        console.log(`User ${userId} joined their room`);
    });
    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
    });
});
app.set('io', io);
app.use(notFoundHandler_1.notFoundHandler);
app.use(errorHandler_1.errorHandler);
const startServer = async () => {
    try {
        await (0, database_1.connectDatabase)();
        await (0, redis_1.connectRedis)();
        await (0, seedData_1.seedInsuranceProviders)();
        const environment = process.env.NODE_ENV || 'development';
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
        server.listen(PORT, () => {
            console.log(`🚀 Server running on port ${PORT}`);
            console.log(`📊 Environment: ${environment}`);
            console.log(`🔗 Frontend URL: ${frontendUrl}`);
        });
    }
    catch (error) {
        console.error('❌ Failed to start server:', error);
        process.exit(1);
    }
};
startServer();
//# sourceMappingURL=server.js.map