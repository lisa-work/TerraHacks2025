import '../config/env';
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
declare class MapsService {
    private client;
    constructor();
    private getApiKey;
    geocodeAddress(address: string): Promise<LocationData | null>;
    reverseGeocode(lat: number, lng: number): Promise<string | null>;
    findNearbyPlaces(params: NearbySearchParams): Promise<{
        placeId: string | undefined;
        name: string | undefined;
        address: string | undefined;
        location: {
            lat: number | undefined;
            lng: number | undefined;
        };
        rating: number | undefined;
        priceLevel: number | undefined;
        types: import("@googlemaps/google-maps-services-js").AddressType[] | undefined;
        photos: {
            photoReference: string;
            width: number;
            height: number;
        }[] | undefined;
    }[]>;
    getPlaceDetails(placeId: string): Promise<{
        placeId: string | undefined;
        name: string | undefined;
        address: string | undefined;
        location: {
            lat: number | undefined;
            lng: number | undefined;
        };
        phone: string | undefined;
        website: string | undefined;
        rating: number | undefined;
        openingHours: string[] | undefined;
        reviews: {
            author: string;
            rating: number;
            text: string;
            time: string;
        }[] | undefined;
        photos: {
            photoReference: string;
            width: number;
            height: number;
        }[] | undefined;
        types: import("@googlemaps/google-maps-services-js").AddressType[] | undefined;
    }>;
    calculateDistanceMatrix(params: DistanceMatrixParams): Promise<{
        origin: string;
        destinations: {
            destination: string;
            distance: import("@googlemaps/google-maps-services-js").Distance;
            duration: import("@googlemaps/google-maps-services-js").Duration;
            status: import("@googlemaps/google-maps-services-js").Status;
        }[];
    }[]>;
    calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number;
    private toRadians;
    generateDirectionsUrl(origin: string, destination: string): string;
    generateStaticMapUrl(params: {
        center: {
            lat: number;
            lng: number;
        };
        zoom: number;
        size: {
            width: number;
            height: number;
        };
        markers?: Array<{
            lat: number;
            lng: number;
            label?: string;
        }>;
    }): string;
}
declare const _default: MapsService;
export default _default;
//# sourceMappingURL=mapsService.d.ts.map