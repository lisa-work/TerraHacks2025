"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const google_maps_services_js_1 = require("@googlemaps/google-maps-services-js");
class MapsService {
    constructor() {
        if (!process.env.GOOGLE_MAPS_API_KEY) {
            throw new Error('GOOGLE_MAPS_API_KEY environment variable is required');
        }
        this.client = new google_maps_services_js_1.Client({});
    }
    async geocodeAddress(address) {
        try {
            const response = await this.client.geocode({
                params: {
                    address,
                    key: process.env.GOOGLE_MAPS_API_KEY
                }
            });
            if (response.data.results.length === 0) {
                return null;
            }
            const result = response.data.results[0];
            return {
                lat: result.geometry.location.lat,
                lng: result.geometry.location.lng,
                address: result.formatted_address
            };
        }
        catch (error) {
            console.error('Geocoding error:', error);
            throw new Error('Failed to geocode address');
        }
    }
    async reverseGeocode(lat, lng) {
        try {
            const response = await this.client.reverseGeocode({
                params: {
                    latlng: { lat, lng },
                    key: process.env.GOOGLE_MAPS_API_KEY
                }
            });
            if (response.data.results.length === 0) {
                return null;
            }
            return response.data.results[0].formatted_address;
        }
        catch (error) {
            console.error('Reverse geocoding error:', error);
            throw new Error('Failed to reverse geocode coordinates');
        }
    }
    async findNearbyPlaces(params) {
        try {
            const response = await this.client.placesNearby({
                params: {
                    location: params.location,
                    radius: params.radius,
                    type: params.type,
                    keyword: params.keyword,
                    key: process.env.GOOGLE_MAPS_API_KEY
                }
            });
            return response.data.results.map(place => ({
                placeId: place.place_id,
                name: place.name,
                address: place.vicinity,
                location: {
                    lat: place.geometry?.location.lat,
                    lng: place.geometry?.location.lng
                },
                rating: place.rating,
                priceLevel: place.price_level,
                types: place.types,
                photos: place.photos?.map(photo => ({
                    photoReference: photo.photo_reference,
                    width: photo.width,
                    height: photo.height
                }))
            }));
        }
        catch (error) {
            console.error('Nearby search error:', error);
            throw new Error('Failed to search nearby places');
        }
    }
    async getPlaceDetails(placeId) {
        try {
            const response = await this.client.placeDetails({
                params: {
                    place_id: placeId,
                    fields: [
                        'name',
                        'formatted_address',
                        'geometry',
                        'formatted_phone_number',
                        'website',
                        'opening_hours',
                        'rating',
                        'reviews',
                        'photos',
                        'types'
                    ],
                    key: process.env.GOOGLE_MAPS_API_KEY
                }
            });
            const place = response.data.result;
            return {
                placeId: place.place_id,
                name: place.name,
                address: place.formatted_address,
                location: {
                    lat: place.geometry?.location.lat,
                    lng: place.geometry?.location.lng
                },
                phone: place.formatted_phone_number,
                website: place.website,
                rating: place.rating,
                openingHours: place.opening_hours?.weekday_text,
                reviews: place.reviews?.map(review => ({
                    author: review.author_name,
                    rating: review.rating,
                    text: review.text,
                    time: review.time
                })),
                photos: place.photos?.map(photo => ({
                    photoReference: photo.photo_reference,
                    width: photo.width,
                    height: photo.height
                })),
                types: place.types
            };
        }
        catch (error) {
            console.error('Place details error:', error);
            throw new Error('Failed to get place details');
        }
    }
    async calculateDistanceMatrix(params) {
        try {
            const response = await this.client.distancematrix({
                params: {
                    origins: params.origins,
                    destinations: params.destinations,
                    units: (params.units || 'metric'),
                    key: process.env.GOOGLE_MAPS_API_KEY
                }
            });
            return response.data.rows.map((row, originIndex) => ({
                origin: params.origins[originIndex],
                destinations: row.elements.map((element, destIndex) => ({
                    destination: params.destinations[destIndex],
                    distance: element.distance,
                    duration: element.duration,
                    status: element.status
                }))
            }));
        }
        catch (error) {
            console.error('Distance matrix error:', error);
            throw new Error('Failed to calculate distance matrix');
        }
    }
    calculateDistance(lat1, lng1, lat2, lng2) {
        const R = 6371;
        const dLat = this.toRadians(lat2 - lat1);
        const dLng = this.toRadians(lng2 - lng1);
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) *
                Math.sin(dLng / 2) * Math.sin(dLng / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }
    toRadians(degrees) {
        return degrees * (Math.PI / 180);
    }
    generateDirectionsUrl(origin, destination) {
        const baseUrl = 'https://www.google.com/maps/dir/';
        const encodedOrigin = encodeURIComponent(origin);
        const encodedDestination = encodeURIComponent(destination);
        return `${baseUrl}${encodedOrigin}/${encodedDestination}`;
    }
    generateStaticMapUrl(params) {
        const baseUrl = 'https://maps.googleapis.com/maps/api/staticmap';
        const center = `${params.center.lat},${params.center.lng}`;
        const size = `${params.size.width}x${params.size.height}`;
        let url = `${baseUrl}?center=${center}&zoom=${params.zoom}&size=${size}`;
        if (params.markers) {
            params.markers.forEach((marker, index) => {
                const markerStr = `${marker.lat},${marker.lng}`;
                const label = marker.label || String.fromCharCode(65 + index);
                url += `&markers=label:${label}|${markerStr}`;
            });
        }
        url += `&key=${process.env.GOOGLE_MAPS_API_KEY}`;
        return url;
    }
}
exports.default = new MapsService();
//# sourceMappingURL=mapsService.js.map