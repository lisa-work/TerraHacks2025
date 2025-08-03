"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getInsuranceProviders = exports.getSpecialties = exports.getNearbyClinicsByLocation = exports.getClinicAvailability = exports.getClinic = exports.searchClinics = void 0;
const Clinic_1 = __importDefault(require("../models/Clinic"));
const mapsService_1 = __importDefault(require("../services/mapsService"));
const redis_1 = require("../config/redis");
const searchClinics = async (req, res, next) => {
    try {
        const { location, lat, lng, radius = 50, type, specialty, insurance, emergencyServices, telemedicine, rating, sortBy = 'distance', page = 1, limit = 20 } = req.query;
        let searchLat;
        let searchLng;
        if (location && typeof location === 'string') {
            const locationData = await mapsService_1.default.geocodeAddress(location);
            if (locationData) {
                searchLat = locationData.lat;
                searchLng = locationData.lng;
            }
        }
        else if (lat && lng) {
            searchLat = parseFloat(lat);
            searchLng = parseFloat(lng);
        }
        let query = {
            isActive: true,
            isVerified: true
        };
        if (searchLat && searchLng) {
            const radiusKm = parseFloat(radius);
            const latRange = radiusKm / 111;
            const lngRange = radiusKm / (111 * Math.cos(searchLat * Math.PI / 180));
            query['location.lat'] = {
                $gte: searchLat - latRange,
                $lte: searchLat + latRange
            };
            query['location.lng'] = {
                $gte: searchLng - lngRange,
                $lte: searchLng + lngRange
            };
        }
        if (type) {
            query.type = type;
        }
        if (specialty) {
            query.specialties = { $in: Array.isArray(specialty) ? specialty : [specialty] };
        }
        if (insurance) {
            query.insuranceAccepted = { $in: Array.isArray(insurance) ? insurance : [insurance] };
        }
        if (emergencyServices === 'true') {
            query.emergencyServices = true;
        }
        if (telemedicine === 'true') {
            query.telemedicineAvailable = true;
        }
        if (rating) {
            query.rating = { $gte: parseFloat(rating) };
        }
        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const skip = (pageNum - 1) * limitNum;
        let clinics = await Clinic_1.default.find(query)
            .skip(skip)
            .limit(limitNum)
            .lean();
        if (searchLat && searchLng) {
            clinics = clinics.map(clinic => {
                const distance = mapsService_1.default.calculateDistance(searchLat, searchLng, clinic.location.lat, clinic.location.lng);
                return {
                    ...clinic,
                    distance: Math.round(distance * 10) / 10
                };
            });
            if (sortBy === 'distance') {
                clinics.sort((a, b) => (a.distance || 0) - (b.distance || 0));
            }
        }
        if (sortBy === 'rating') {
            clinics.sort((a, b) => b.rating - a.rating);
        }
        else if (sortBy === 'name') {
            clinics.sort((a, b) => a.name.localeCompare(b.name));
        }
        const total = await Clinic_1.default.countDocuments(query);
        const cacheKey = `clinic_search_${JSON.stringify({ location, lat, lng, radius, type, specialty, insurance })}_${pageNum}`;
        await (0, redis_1.setCache)(cacheKey, { clinics, total }, 600);
        res.status(200).json({
            success: true,
            clinics,
            pagination: {
                currentPage: pageNum,
                totalPages: Math.ceil(total / limitNum),
                totalItems: total,
                itemsPerPage: limitNum
            }
        });
    }
    catch (error) {
        next(error);
    }
};
exports.searchClinics = searchClinics;
const getClinic = async (req, res, next) => {
    try {
        const { id } = req.params;
        const cacheKey = `clinic_${id}`;
        let clinic = await (0, redis_1.getCache)(cacheKey);
        if (!clinic) {
            clinic = await Clinic_1.default.findById(id);
            if (!clinic) {
                return res.status(404).json({
                    success: false,
                    error: 'Clinic not found'
                });
            }
            await (0, redis_1.setCache)(cacheKey, clinic, 3600);
        }
        res.status(200).json({
            success: true,
            clinic
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getClinic = getClinic;
const getClinicAvailability = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { date, duration = 30 } = req.query;
        const clinic = await Clinic_1.default.findById(id);
        if (!clinic) {
            return res.status(404).json({
                success: false,
                error: 'Clinic not found'
            });
        }
        const requestedDate = date ? new Date(date) : new Date();
        const dayOfWeek = requestedDate.toLocaleDateString('en-US', { weekday: 'long' });
        const operatingHours = clinic.operatingHours.find(hours => hours.day === dayOfWeek);
        if (!operatingHours || !operatingHours.isOpen) {
            return res.status(200).json({
                success: true,
                availableSlots: [],
                message: 'Clinic is closed on this day'
            });
        }
        const slots = generateTimeSlots(operatingHours.open, operatingHours.close, parseInt(duration));
        res.status(200).json({
            success: true,
            availableSlots: slots,
            operatingHours: {
                open: operatingHours.open,
                close: operatingHours.close
            }
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getClinicAvailability = getClinicAvailability;
const getNearbyClinicsByLocation = async (req, res, next) => {
    try {
        const { lat, lng, radius = 25, limit = 10 } = req.query;
        if (!lat || !lng) {
            return res.status(400).json({
                success: false,
                error: 'Latitude and longitude are required'
            });
        }
        const searchLat = parseFloat(lat);
        const searchLng = parseFloat(lng);
        const radiusKm = parseFloat(radius);
        const latRange = radiusKm / 111;
        const lngRange = radiusKm / (111 * Math.cos(searchLat * Math.PI / 180));
        const query = {
            isActive: true,
            isVerified: true,
            'location.lat': {
                $gte: searchLat - latRange,
                $lte: searchLat + latRange
            },
            'location.lng': {
                $gte: searchLng - lngRange,
                $lte: searchLng + lngRange
            }
        };
        let clinics = await Clinic_1.default.find(query)
            .limit(parseInt(limit))
            .lean();
        clinics = clinics.map(clinic => {
            const distance = mapsService_1.default.calculateDistance(searchLat, searchLng, clinic.location.lat, clinic.location.lng);
            return {
                ...clinic,
                distance: Math.round(distance * 10) / 10
            };
        }).sort((a, b) => (a.distance || 0) - (b.distance || 0));
        res.status(200).json({
            success: true,
            clinics
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getNearbyClinicsByLocation = getNearbyClinicsByLocation;
const getSpecialties = async (req, res, next) => {
    try {
        const cacheKey = 'clinic_specialties';
        let specialties = await (0, redis_1.getCache)(cacheKey);
        if (!specialties) {
            const result = await Clinic_1.default.aggregate([
                { $match: { isActive: true } },
                { $unwind: '$specialties' },
                { $group: { _id: '$specialties', count: { $sum: 1 } } },
                { $sort: { count: -1 } },
                { $project: { specialty: '$_id', count: 1, _id: 0 } }
            ]);
            specialties = result;
            await (0, redis_1.setCache)(cacheKey, specialties, 3600);
        }
        res.status(200).json({
            success: true,
            specialties
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getSpecialties = getSpecialties;
const getInsuranceProviders = async (req, res, next) => {
    try {
        const cacheKey = 'insurance_providers';
        let providers = await (0, redis_1.getCache)(cacheKey);
        if (!providers) {
            const result = await Clinic_1.default.aggregate([
                { $match: { isActive: true } },
                { $unwind: '$insuranceAccepted' },
                { $group: { _id: '$insuranceAccepted', count: { $sum: 1 } } },
                { $sort: { count: -1 } },
                { $project: { provider: '$_id', count: 1, _id: 0 } }
            ]);
            providers = result;
            await (0, redis_1.setCache)(cacheKey, providers, 3600);
        }
        res.status(200).json({
            success: true,
            providers
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getInsuranceProviders = getInsuranceProviders;
const generateTimeSlots = (openTime, closeTime, duration) => {
    const slots = [];
    const [openHour, openMinute] = openTime.split(':').map(Number);
    const [closeHour, closeMinute] = closeTime.split(':').map(Number);
    const startTime = new Date();
    startTime.setHours(openHour, openMinute, 0, 0);
    const endTime = new Date();
    endTime.setHours(closeHour, closeMinute, 0, 0);
    const currentTime = new Date(startTime);
    while (currentTime < endTime) {
        const timeString = currentTime.toTimeString().slice(0, 5);
        slots.push(timeString);
        currentTime.setMinutes(currentTime.getMinutes() + duration);
    }
    return slots;
};
//# sourceMappingURL=clinicController.js.map