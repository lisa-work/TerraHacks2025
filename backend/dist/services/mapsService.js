"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const MapsService = {
    geocodeAddress: async (address) => {
        console.log(`Mock geocodeAddress called with: ${address}`);
        return {
            lat: 43.6532,
            lng: -79.3832,
            address: "Mock Address, Toronto, ON"
        };
    },
    reverseGeocode: async (lat, lng) => {
        console.log(`Mock reverseGeocode called with: ${lat}, ${lng}`);
        return "Mock Reverse Geocoded Address";
    },
    findNearbyPlaces: async (params) => {
        console.log("Mock findNearbyPlaces called with:", params);
        return [
            {
                placeId: "mock123",
                name: "Mock Clinic",
                address: "123 Mock St",
                location: { lat: params.location.lat, lng: params.location.lng },
                rating: 4.5,
                priceLevel: 2,
                types: ["clinic"],
                photos: []
            }
        ];
    },
    getPlaceDetails: async (placeId) => {
        console.log(`Mock getPlaceDetails called with: ${placeId}`);
        return {
            placeId: "mock123",
            name: "Mock Clinic",
            address: "123 Mock St",
            location: { lat: 43.65, lng: -79.38 },
            phone: "123-456-7890",
            website: "https://mockclinic.com",
            rating: 4.5,
            openingHours: ["Mon-Fri: 9am - 5pm"],
            reviews: [],
            photos: [],
            types: ["clinic"]
        };
    },
    calculateDistanceMatrix: async (params) => {
        console.log("Mock calculateDistanceMatrix called with:", params);
        return params.origins.map((origin) => ({
            origin,
            destinations: params.destinations.map((destination) => ({
                destination,
                distance: { text: "5 km", value: 5000 },
                duration: { text: "10 mins", value: 600 },
                status: "OK"
            }))
        }));
    },
    calculateDistance: (lat1, lng1, lat2, lng2) => {
        console.log(`Mock calculateDistance: (${lat1}, ${lng1}) to (${lat2}, ${lng2})`);
        return 5.0;
    },
    generateDirectionsUrl: (origin, destination) => {
        console.log(`Mock generateDirectionsUrl: ${origin} → ${destination}`);
        return `https://www.google.com/maps/dir/${origin}/${destination}`;
    },
    generateStaticMapUrl: () => {
        console.log("Mock generateStaticMapUrl called");
        return "https://maps.googleapis.com/maps/api/staticmap?mock=true";
    }
};
exports.default = MapsService;
//# sourceMappingURL=mapsService.js.map