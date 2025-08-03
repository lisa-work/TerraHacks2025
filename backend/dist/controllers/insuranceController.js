"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateInsuranceProvider = exports.createInsuranceProvider = exports.getInsuranceProvider = exports.getAllInsuranceProviders = exports.searchInsuranceProviders = void 0;
const InsuranceProvider_1 = __importDefault(require("../models/InsuranceProvider"));
const aiService_1 = require("../services/aiService");
const searchInsuranceProviders = async (req, res, next) => {
    try {
        const { q: query, state, type = 'health' } = req.query;
        if (!query) {
            return res.status(400).json({
                success: false,
                error: 'Search query is required'
            });
        }
        let providers = await InsuranceProvider_1.default.find({
            $and: [
                { isActive: true },
                { type },
                ...(state ? [{ states: state }] : []),
                {
                    $or: [
                        { name: { $regex: query, $options: 'i' } },
                        { searchKeywords: { $in: [query.toLowerCase()] } }
                    ]
                }
            ]
        }).limit(10);
        if (providers.length === 0) {
            try {
                const aiSuggestion = await (0, aiService_1.generateAIInsuranceMatch)(query, state);
                if (aiSuggestion) {
                    const existingProvider = await InsuranceProvider_1.default.findOne({
                        name: { $regex: aiSuggestion.name, $options: 'i' }
                    });
                    if (!existingProvider) {
                        const newProvider = await InsuranceProvider_1.default.create({
                            ...aiSuggestion,
                            addedBy: 'ai',
                            searchKeywords: [
                                ...aiSuggestion.searchKeywords,
                                query.toLowerCase()
                            ]
                        });
                        providers = [newProvider];
                    }
                    else {
                        if (!existingProvider.searchKeywords.includes(query.toLowerCase())) {
                            existingProvider.searchKeywords.push(query.toLowerCase());
                            await existingProvider.save();
                        }
                        providers = [existingProvider];
                    }
                }
            }
            catch (aiError) {
                console.error('AI insurance matching failed:', aiError);
            }
        }
        res.status(200).json({
            success: true,
            count: providers.length,
            data: providers
        });
    }
    catch (error) {
        next(error);
    }
};
exports.searchInsuranceProviders = searchInsuranceProviders;
const getAllInsuranceProviders = async (req, res, next) => {
    try {
        const { type = 'health', state, page = 1, limit = 50 } = req.query;
        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const skip = (pageNum - 1) * limitNum;
        const filter = { isActive: true, type };
        if (state) {
            filter.states = state;
        }
        const providers = await InsuranceProvider_1.default.find(filter)
            .sort({ name: 1 })
            .skip(skip)
            .limit(limitNum);
        const total = await InsuranceProvider_1.default.countDocuments(filter);
        res.status(200).json({
            success: true,
            count: providers.length,
            total,
            page: pageNum,
            pages: Math.ceil(total / limitNum),
            data: providers
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getAllInsuranceProviders = getAllInsuranceProviders;
const getInsuranceProvider = async (req, res, next) => {
    try {
        const provider = await InsuranceProvider_1.default.findById(req.params.id);
        if (!provider) {
            return res.status(404).json({
                success: false,
                error: 'Insurance provider not found'
            });
        }
        res.status(200).json({
            success: true,
            data: provider
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getInsuranceProvider = getInsuranceProvider;
const createInsuranceProvider = async (req, res, next) => {
    try {
        const providerData = {
            ...req.body,
            addedBy: 'user'
        };
        const provider = await InsuranceProvider_1.default.create(providerData);
        res.status(201).json({
            success: true,
            data: provider
        });
    }
    catch (error) {
        next(error);
    }
};
exports.createInsuranceProvider = createInsuranceProvider;
const updateInsuranceProvider = async (req, res, next) => {
    try {
        const provider = await InsuranceProvider_1.default.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });
        if (!provider) {
            return res.status(404).json({
                success: false,
                error: 'Insurance provider not found'
            });
        }
        res.status(200).json({
            success: true,
            data: provider
        });
    }
    catch (error) {
        next(error);
    }
};
exports.updateInsuranceProvider = updateInsuranceProvider;
//# sourceMappingURL=insuranceController.js.map