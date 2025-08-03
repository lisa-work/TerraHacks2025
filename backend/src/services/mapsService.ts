// import { Client } from '@googlemaps/google-maps-services-js';

// interface LocationData {
//   lat: number;
//   lng: number;
//   address: string;
// }

// interface NearbySearchParams {
//   location: {
//     lat: number;
//     lng: number;
//   };
//   radius: number; // in meters
//   type?: string;
//   keyword?: string;
// }

// interface DistanceMatrixParams {
//   origins: string[];
//   destinations: string[];
//   units?: 'metric' | 'imperial';
// }

// class MapsService {
//   private client: Client;

//   constructor() {
//     if (!process.env.GOOGLE_MAPS_API_KEY) {
//       throw new Error('GOOGLE_MAPS_API_KEY environment variable is required');
//     }
    
//     this.client = new Client({});
//   }

//   async geocodeAddress(address: string): Promise<LocationData | null> {
//     try {
//       const response = await this.client.geocode({
//         params: {
//           address,
//           key: process.env.GOOGLE_MAPS_API_KEY!
//         }
//       });

//       if (response.data.results.length === 0) {
//         return null;
//       }

//       const result = response.data.results[0];
//       return {
//         lat: result.geometry.location.lat,
//         lng: result.geometry.location.lng,
//         address: result.formatted_address
//       };
//     } catch (error) {
//       console.error('Geocoding error:', error);
//       throw new Error('Failed to geocode address');
//     }
//   }

//   async reverseGeocode(lat: number, lng: number): Promise<string | null> {
//     try {
//       const response = await this.client.reverseGeocode({
//         params: {
//           latlng: { lat, lng },
//           key: process.env.GOOGLE_MAPS_API_KEY!
//         }
//       });

//       if (response.data.results.length === 0) {
//         return null;
//       }

//       return response.data.results[0].formatted_address;
//     } catch (error) {
//       console.error('Reverse geocoding error:', error);
//       throw new Error('Failed to reverse geocode coordinates');
//     }
//   }

//   async findNearbyPlaces(params: NearbySearchParams) {
//     try {
//       const response = await this.client.placesNearby({
//         params: {
//           location: params.location,
//           radius: params.radius,
//           type: params.type,
//           keyword: params.keyword,
//           key: process.env.GOOGLE_MAPS_API_KEY!
//         }
//       });

//       return response.data.results.map(place => ({
//         placeId: place.place_id,
//         name: place.name,
//         address: place.vicinity,
//         location: {
//           lat: place.geometry?.location.lat,
//           lng: place.geometry?.location.lng
//         },
//         rating: place.rating,
//         priceLevel: place.price_level,
//         types: place.types,
//         photos: place.photos?.map(photo => ({
//           photoReference: photo.photo_reference,
//           width: photo.width,
//           height: photo.height
//         }))
//       }));
//     } catch (error) {
//       console.error('Nearby search error:', error);
//       throw new Error('Failed to search nearby places');
//     }
//   }

//   async getPlaceDetails(placeId: string) {
//     try {
//       const response = await this.client.placeDetails({
//         params: {
//           place_id: placeId,
//           fields: [
//             'name',
//             'formatted_address',
//             'geometry',
//             'formatted_phone_number',
//             'website',
//             'opening_hours',
//             'rating',
//             'reviews',
//             'photos',
//             'types'
//           ],
//           key: process.env.GOOGLE_MAPS_API_KEY!
//         }
//       });

//       const place = response.data.result;
//       return {
//         placeId: place.place_id,
//         name: place.name,
//         address: place.formatted_address,
//         location: {
//           lat: place.geometry?.location.lat,
//           lng: place.geometry?.location.lng
//         },
//         phone: place.formatted_phone_number,
//         website: place.website,
//         rating: place.rating,
//         openingHours: place.opening_hours?.weekday_text,
//         reviews: place.reviews?.map(review => ({
//           author: review.author_name,
//           rating: review.rating,
//           text: review.text,
//           time: review.time
//         })),
//         photos: place.photos?.map(photo => ({
//           photoReference: photo.photo_reference,
//           width: photo.width,
//           height: photo.height
//         })),
//         types: place.types
//       };
//     } catch (error) {
//       console.error('Place details error:', error);
//       throw new Error('Failed to get place details');
//     }
//   }

//   async calculateDistanceMatrix(params: DistanceMatrixParams) {
//     try {
//       const response = await this.client.distancematrix({
//         params: {
//           origins: params.origins,
//           destinations: params.destinations,
//           units: (params.units || 'metric') as any,
//           key: process.env.GOOGLE_MAPS_API_KEY!
//         }
//       });

//       return response.data.rows.map((row, originIndex) => ({
//         origin: params.origins[originIndex],
//         destinations: row.elements.map((element, destIndex) => ({
//           destination: params.destinations[destIndex],
//           distance: element.distance,
//           duration: element.duration,
//           status: element.status
//         }))
//       }));
//     } catch (error) {
//       console.error('Distance matrix error:', error);
//       throw new Error('Failed to calculate distance matrix');
//     }
//   }

//   calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
//     const R = 6371; // Earth's radius in kilometers
//     const dLat = this.toRadians(lat2 - lat1);
//     const dLng = this.toRadians(lng2 - lng1);
    
//     const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
//               Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) *
//               Math.sin(dLng / 2) * Math.sin(dLng / 2);
    
//     const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    
//     return R * c; // Distance in kilometers
//   }

//   private toRadians(degrees: number): number {
//     return degrees * (Math.PI / 180);
//   }

//   generateDirectionsUrl(origin: string, destination: string): string {
//     const baseUrl = 'https://www.google.com/maps/dir/';
//     const encodedOrigin = encodeURIComponent(origin);
//     const encodedDestination = encodeURIComponent(destination);
    
//     return `${baseUrl}${encodedOrigin}/${encodedDestination}`;
//   }

//   generateStaticMapUrl(params: {
//     center: { lat: number; lng: number };
//     zoom: number;
//     size: { width: number; height: number };
//     markers?: Array<{ lat: number; lng: number; label?: string }>;
//   }): string {
//     const baseUrl = 'https://maps.googleapis.com/maps/api/staticmap';
//     const center = `${params.center.lat},${params.center.lng}`;
//     const size = `${params.size.width}x${params.size.height}`;
    
//     let url = `${baseUrl}?center=${center}&zoom=${params.zoom}&size=${size}`;
    
//     if (params.markers) {
//       params.markers.forEach((marker, index) => {
//         const markerStr = `${marker.lat},${marker.lng}`;
//         const label = marker.label || String.fromCharCode(65 + index); // A, B, C...
//         url += `&markers=label:${label}|${markerStr}`;
//       });
//     }
    
//     url += `&key=${process.env.GOOGLE_MAPS_API_KEY}`;
    
//     return url;
//   }
// }

// export default new MapsService();

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

// ⛔ No API key or client needed — pure mock
const MapsService = {
  geocodeAddress: async (address: string): Promise<LocationData | null> => {
    console.log(`Mock geocodeAddress called with: ${address}`);
    return {
      lat: 43.6532,
      lng: -79.3832,
      address: "Mock Address, Toronto, ON"
    };
  },

  reverseGeocode: async (lat: number, lng: number): Promise<string | null> => {
    console.log(`Mock reverseGeocode called with: ${lat}, ${lng}`);
    return "Mock Reverse Geocoded Address";
  },

  findNearbyPlaces: async (params: NearbySearchParams) => {
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

  getPlaceDetails: async (placeId: string) => {
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

  calculateDistanceMatrix: async (params: DistanceMatrixParams) => {
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

  calculateDistance: (lat1: number, lng1: number, lat2: number, lng2: number): number => {
    console.log(`Mock calculateDistance: (${lat1}, ${lng1}) to (${lat2}, ${lng2})`);
    return 5.0; // km
  },

  generateDirectionsUrl: (origin: string, destination: string): string => {
    console.log(`Mock generateDirectionsUrl: ${origin} → ${destination}`);
    return `https://www.google.com/maps/dir/${origin}/${destination}`;
  },

  generateStaticMapUrl: () => {
    console.log("Mock generateStaticMapUrl called");
    return "https://maps.googleapis.com/maps/api/staticmap?mock=true";
  }
};

export default MapsService;
