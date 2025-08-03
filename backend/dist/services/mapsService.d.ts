interface LocationData {
    lat: number;
    lng: number;
    address: string;
}
interface NearbySearchParams {
    location: {
        lat: number;
        lng: number;
    };
    radius: number;
    type?: string;
    keyword?: string;
}
interface DistanceMatrixParams {
    origins: string[];
    destinations: string[];
    units?: 'metric' | 'imperial';
}
declare const MapsService: {
    geocodeAddress: (address: string) => Promise<LocationData | null>;
    reverseGeocode: (lat: number, lng: number) => Promise<string | null>;
    findNearbyPlaces: (params: NearbySearchParams) => Promise<{
        placeId: string;
        name: string;
        address: string;
        location: {
            lat: number;
            lng: number;
        };
        rating: number;
        priceLevel: number;
        types: string[];
        photos: never[];
    }[]>;
    getPlaceDetails: (placeId: string) => Promise<{
        placeId: string;
        name: string;
        address: string;
        location: {
            lat: number;
            lng: number;
        };
        phone: string;
        website: string;
        rating: number;
        openingHours: string[];
        reviews: never[];
        photos: never[];
        types: string[];
    }>;
    calculateDistanceMatrix: (params: DistanceMatrixParams) => Promise<{
        origin: string;
        destinations: {
            destination: string;
            distance: {
                text: string;
                value: number;
            };
            duration: {
                text: string;
                value: number;
            };
            status: string;
        }[];
    }[]>;
    calculateDistance: (lat1: number, lng1: number, lat2: number, lng2: number) => number;
    generateDirectionsUrl: (origin: string, destination: string) => string;
    generateStaticMapUrl: () => string;
};
export default MapsService;
//# sourceMappingURL=mapsService.d.ts.map