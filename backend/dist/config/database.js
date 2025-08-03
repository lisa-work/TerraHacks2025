"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectDatabase = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const connectDatabase = async () => {
    try {
        const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/mediconnect';
        await mongoose_1.default.connect(mongoUri, {});
        console.log('✅ MongoDB connected successfully');
        mongoose_1.default.connection.on('error', (error) => {
            console.error('❌ MongoDB connection error:', error);
        });
        mongoose_1.default.connection.on('disconnected', () => {
            console.log('📤 MongoDB disconnected');
        });
        process.on('SIGINT', async () => {
            await mongoose_1.default.connection.close();
            console.log('📤 MongoDB connection closed due to app termination');
            process.exit(0);
        });
    }
    catch (error) {
        console.error('❌ MongoDB connection failed:', error);
        process.exit(1);
    }
};
exports.connectDatabase = connectDatabase;
//# sourceMappingURL=database.js.map