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
const InsuranceProviderSchema = new mongoose_1.Schema({
    name: {
        type: String,
        required: [true, 'Insurance provider name is required'],
        unique: true,
        trim: true,
        maxlength: [200, 'Provider name cannot exceed 200 characters']
    },
    type: {
        type: String,
        enum: ['health', 'dental', 'vision', 'combined'],
        default: 'health'
    },
    networks: [{
            type: String,
            trim: true
        }],
    states: [{
            type: String,
            uppercase: true,
            length: 2
        }],
    planTypes: [{
            type: String,
            trim: true
        }],
    contactInfo: {
        phone: {
            type: String,
            required: [true, 'Contact phone is required'],
            match: [/^\+?[\d\s\-\(\)]+$/, 'Please enter a valid phone number']
        },
        website: {
            type: String,
            trim: true,
            match: [/^https?:\/\/.+/, 'Please enter a valid website URL']
        },
        customerService: {
            type: String,
            trim: true,
            match: [/^\+?[\d\s\-\(\)]+$/, 'Please enter a valid phone number']
        }
    },
    coverage: {
        inNetwork: {
            primaryCare: { type: Number, default: 20 },
            specialist: { type: Number, default: 40 },
            emergency: { type: Number, default: 150 },
            urgentCare: { type: Number, default: 50 },
            prescription: { type: Number, default: 10 }
        },
        outOfNetwork: {
            primaryCare: { type: Number, default: 60 },
            specialist: { type: Number, default: 100 },
            emergency: { type: Number, default: 300 },
            urgentCare: { type: Number, default: 100 },
            prescription: { type: Number, default: 30 }
        },
        deductible: {
            individual: { type: Number, default: 1500 },
            family: { type: Number, default: 3000 }
        },
        outOfPocketMax: {
            individual: { type: Number, default: 8000 },
            family: { type: Number, default: 16000 }
        }
    },
    searchKeywords: [{
            type: String,
            lowercase: true,
            trim: true
        }],
    isActive: {
        type: Boolean,
        default: true
    },
    addedBy: {
        type: String,
        enum: ['system', 'user', 'ai'],
        default: 'user'
    }
}, {
    timestamps: true
});
InsuranceProviderSchema.index({ name: 'text', searchKeywords: 'text' });
InsuranceProviderSchema.index({ states: 1 });
InsuranceProviderSchema.index({ type: 1 });
InsuranceProviderSchema.index({ isActive: 1 });
exports.default = mongoose_1.default.model('InsuranceProvider', InsuranceProviderSchema);
//# sourceMappingURL=InsuranceProvider.js.map