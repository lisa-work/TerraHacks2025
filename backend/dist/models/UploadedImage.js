"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importStar(require("mongoose"));
const UploadedImageSchema = new mongoose_1.Schema({
    userId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'User ID is required']
    },
    fileName: {
        type: String,
        required: [true, 'File name is required'],
        trim: true
    },
    originalName: {
        type: String,
        required: [true, 'Original file name is required'],
        trim: true
    },
    filePath: {
        type: String,
        required: [true, 'File path is required'],
        trim: true
    },
    fileSize: {
        type: Number,
        required: [true, 'File size is required'],
        min: [0, 'File size cannot be negative']
    },
    mimeType: {
        type: String,
        required: [true, 'MIME type is required'],
        enum: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
    },
    description: {
        type: String,
        trim: true,
        maxlength: [1000, 'Description cannot exceed 1000 characters']
    },
    aiAnalysis: {
        analyzed: {
            type: Boolean,
            default: false
        },
        confidence: {
            type: Number,
            min: 0,
            max: 100
        },
        findings: [{
                type: String,
                trim: true
            }],
        urgencyLevel: {
            type: String,
            enum: ['low', 'medium', 'high', 'critical']
        },
        recommendations: [{
                type: String,
                trim: true
            }],
        medicalTerms: [{
                type: String,
                trim: true,
                lowercase: true
            }],
        bodyParts: [{
                type: String,
                trim: true,
                lowercase: true
            }],
        analysisDate: Date,
        model: {
            type: String,
            trim: true
        }
    },
    relatedSymptoms: [{
            type: String,
            trim: true
        }],
    triageSessionId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'TriageSession'
    },
    appointmentId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Appointment'
    },
    isDeleted: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});
UploadedImageSchema.index({ userId: 1, createdAt: -1 });
UploadedImageSchema.index({ triageSessionId: 1 });
UploadedImageSchema.index({ appointmentId: 1 });
UploadedImageSchema.index({ 'aiAnalysis.urgencyLevel': 1 });
UploadedImageSchema.index({ isDeleted: 1 });
exports.default = mongoose_1.default.model('UploadedImage', UploadedImageSchema);
//# sourceMappingURL=UploadedImage.js.map