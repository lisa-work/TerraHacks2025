"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getEmergencyFacilities = exports.reverseGeocode = void 0;
const mapsService_1 = __importDefault(require("../services/mapsService"));
const reverseGeocode = async (req, res, next) => {
    try {
        const { lat, lng } = req.query;
        if (!lat || !lng) {
            return res.status(400).json({ success: false, error: 'lat and lng are required' });
        }
        const address = await mapsService_1.default.reverseGeocode(parseFloat(lat), parseFloat(lng));
        return res.status(200).json({ success: true, address });
    }
    catch (error) {
        next(error);
    }
};
exports.reverseGeocode = reverseGeocode;
const getEmergencyFacilities = async (req, res, next) => {
    try {
        const { lat, lng } = req.query;
        if (!lat || !lng) {
            return res.status(400).json({ success: false, error: 'lat and lng are required' });
        }
        const location = {
            lat: parseFloat(lat),
            lng: parseFloat(lng)
        };
        const places = await mapsService_1.default.findNearbyPlaces({
            location,
            radius: 10000,
            type: 'hospital',
            keyword: 'emergency'
        });
        const facilities = await Promise.all(places.slice(0, 5).map(async (place) => {
            let phone = '';
            try {
                const details = await mapsService_1.default.getPlaceDetails(place.placeId);
                phone = details.phone || '';
            }
            catch (err) {
            }
            const distanceKm = mapsService_1.default.calculateDistance(location.lat, location.lng, place.location.lat, place.location.lng);
            const eta = Math.round((distanceKm / 50) * 60);
            return {
                id: place.placeId,
                name: place.name,
                type: place.types?.includes('hospital') ? 'hospital' : 'urgent_care',
                address: place.address,
                phone,
                distance: Math.round(distanceKm * 10) / 10,
                eta,
                availability: 'medium',
                specialties: []
            };
        }));
        res.status(200).json({ success: true, facilities });
    }
    catch (error) {
        next(error);
    }
};
exports.getEmergencyFacilities = getEmergencyFacilities;
//# sourceMappingURL=locationController.js.map