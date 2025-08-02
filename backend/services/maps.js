const { Client } = require('@googlemaps/google-maps-services');

// Initialize Google Maps client
const client = new Client({});

/**
 * Geocode an address to get coordinates
 * @param {string|object} address - Address string or object with address components
 * @returns {object} Geocoded result with coordinates
 */
async function getGeocode(address) {
  try {
    let addressString;
    
    if (typeof address === 'string') {
      addressString = address;
    } else if (typeof address === 'object') {
      // Build address string from components
      const components = [];
      if (address.street) components.push(address.street);
      if (address.city) components.push(address.city);
      if (address.state) components.push(address.state);
      if (address.zipCode) components.push(address.zipCode);
      if (address.country) components.push(address.country);
      addressString = components.join(', ');
    } else {
      throw new Error('Invalid address format');
    }

    const response = await client.geocode({
      params: {
        address: addressString,
        key: process.env.VITE_GOOGLE_MAPS_API_KEY || 'your_google_maps_key_here'
      }
    });

    if (response.data.results && response.data.results.length > 0) {
      const result = response.data.results[0];
      const location = result.geometry.location;
      
      return {
        latitude: location.lat,
        longitude: location.lng,
        formattedAddress: result.formatted_address,
        addressComponents: result.address_components,
        placeId: result.place_id
      };
    } else {
      throw new Error('No geocoding results found');
    }
    
  } catch (error) {
    console.error('Geocoding error:', error);
    throw new Error('Failed to geocode address: ' + error.message);
  }
}

/**
 * Reverse geocode coordinates to get address
 * @param {number} latitude - Latitude coordinate
 * @param {number} longitude - Longitude coordinate
 * @returns {object} Reverse geocoded result with address
 */
async function reverseGeocode(latitude, longitude) {
  try {
    const response = await client.reverseGeocode({
      params: {
        latlng: { lat: latitude, lng: longitude },
        key: process.env.VITE_GOOGLE_MAPS_API_KEY || 'your_google_maps_key_here'
      }
    });

    if (response.data.results && response.data.results.length > 0) {
      const result = response.data.results[0];
      
      return {
        formattedAddress: result.formatted_address,
        addressComponents: result.address_components,
        placeId: result.place_id,
        coordinates: { latitude, longitude }
      };
    } else {
      throw new Error('No reverse geocoding results found');
    }
    
  } catch (error) {
    console.error('Reverse geocoding error:', error);
    throw new Error('Failed to reverse geocode coordinates: ' + error.message);
  }
}

/**
 * Find nearby healthcare facilities
 * @param {number} latitude - Latitude coordinate
 * @param {number} longitude - Longitude coordinate
 * @param {number} radius - Search radius in meters (default: 5000)
 * @param {string} type - Type of healthcare facility (default: 'hospital')
 * @returns {Array} Array of nearby healthcare facilities
 */
async function findNearbyHealthcare(latitude, longitude, radius = 5000, type = 'hospital') {
  try {
    const response = await client.placesNearby({
      params: {
        location: { lat: latitude, lng: longitude },
        radius: radius,
        type: type,
        keyword: 'healthcare medical hospital clinic',
        key: process.env.VITE_GOOGLE_MAPS_API_KEY || 'your_google_maps_key_here'
      }
    });

    if (response.data.results) {
      return response.data.results.map(place => ({
        placeId: place.place_id,
        name: place.name,
        address: place.vicinity,
        location: {
          latitude: place.geometry.location.lat,
          longitude: place.geometry.location.lng
        },
        rating: place.rating,
        userRatingsTotal: place.user_ratings_total,
        types: place.types,
        openNow: place.opening_hours?.open_now,
        photos: place.photos?.map(photo => ({
          photoReference: photo.photo_reference,
          height: photo.height,
          width: photo.width
        }))
      }));
    } else {
      return [];
    }
    
  } catch (error) {
    console.error('Find nearby healthcare error:', error);
    throw new Error('Failed to find nearby healthcare facilities: ' + error.message);
  }
}

/**
 * Get place details for a specific healthcare facility
 * @param {string} placeId - Google Places ID
 * @returns {object} Detailed place information
 */
async function getPlaceDetails(placeId) {
  try {
    const response = await client.placeDetails({
      params: {
        place_id: placeId,
        fields: ['name', 'formatted_address', 'formatted_phone_number', 'website', 'opening_hours', 'rating', 'user_ratings_total', 'geometry', 'types', 'photos'],
        key: process.env.VITE_GOOGLE_MAPS_API_KEY || 'your_google_maps_key_here'
      }
    });

    if (response.data.result) {
      const place = response.data.result;
      
      return {
        placeId: place.place_id,
        name: place.name,
        address: place.formatted_address,
        phone: place.formatted_phone_number,
        website: place.website,
        location: {
          latitude: place.geometry.location.lat,
          longitude: place.geometry.location.lng
        },
        rating: place.rating,
        userRatingsTotal: place.user_ratings_total,
        types: place.types,
        openingHours: place.opening_hours?.weekday_text,
        openNow: place.opening_hours?.open_now,
        photos: place.photos?.map(photo => ({
          photoReference: photo.photo_reference,
          height: photo.height,
          width: photo.width
        }))
      };
    } else {
      throw new Error('Place details not found');
    }
    
  } catch (error) {
    console.error('Get place details error:', error);
    throw new Error('Failed to get place details: ' + error.message);
  }
}

/**
 * Calculate distance between two coordinates
 * @param {number} lat1 - First latitude
 * @param {number} lng1 - First longitude
 * @param {number} lat2 - Second latitude
 * @param {number} lng2 - Second longitude
 * @returns {object} Distance information
 */
async function calculateDistance(lat1, lng1, lat2, lng2) {
  try {
    const response = await client.distancematrix({
      params: {
        origins: [{ lat: lat1, lng: lng1 }],
        destinations: [{ lat: lat2, lng: lng2 }],
        mode: 'driving',
        units: 'metric',
        key: process.env.VITE_GOOGLE_MAPS_API_KEY || 'your_google_maps_key_here'
      }
    });

    if (response.data.rows && response.data.rows[0].elements && response.data.rows[0].elements[0]) {
      const element = response.data.rows[0].elements[0];
      
      return {
        distance: element.distance,
        duration: element.duration,
        status: element.status
      };
    } else {
      throw new Error('Distance calculation failed');
    }
    
  } catch (error) {
    console.error('Calculate distance error:', error);
    throw new Error('Failed to calculate distance: ' + error.message);
  }
}

/**
 * Get directions between two points
 * @param {object} origin - Origin coordinates or address
 * @param {object} destination - Destination coordinates or address
 * @param {string} mode - Travel mode (driving, walking, bicycling, transit)
 * @returns {object} Directions information
 */
async function getDirections(origin, destination, mode = 'driving') {
  try {
    const response = await client.directions({
      params: {
        origin: origin,
        destination: destination,
        mode: mode,
        key: process.env.VITE_GOOGLE_MAPS_API_KEY || 'your_google_maps_key_here'
      }
    });

    if (response.data.routes && response.data.routes.length > 0) {
      const route = response.data.routes[0];
      const leg = route.legs[0];
      
      return {
        distance: leg.distance,
        duration: leg.duration,
        startAddress: leg.start_address,
        endAddress: leg.end_address,
        steps: leg.steps.map(step => ({
          instruction: step.html_instructions,
          distance: step.distance,
          duration: step.duration,
          travelMode: step.travel_mode
        })),
        polyline: route.overview_polyline.points
      };
    } else {
      throw new Error('No route found');
    }
    
  } catch (error) {
    console.error('Get directions error:', error);
    throw new Error('Failed to get directions: ' + error.message);
  }
}

/**
 * Search for healthcare facilities by text
 * @param {string} query - Search query (e.g., "cardiologist", "urgent care")
 * @param {object} location - Location coordinates
 * @param {number} radius - Search radius in meters
 * @returns {Array} Array of healthcare facilities
 */
async function searchHealthcareFacilities(query, location, radius = 5000) {
  try {
    const response = await client.textSearch({
      params: {
        query: query,
        location: { lat: location.latitude, lng: location.longitude },
        radius: radius,
        type: 'health',
        key: process.env.VITE_GOOGLE_MAPS_API_KEY || 'your_google_maps_key_here'
      }
    });

    if (response.data.results) {
      return response.data.results.map(place => ({
        placeId: place.place_id,
        name: place.name,
        address: place.formatted_address,
        location: {
          latitude: place.geometry.location.lat,
          longitude: place.geometry.location.lng
        },
        rating: place.rating,
        userRatingsTotal: place.user_ratings_total,
        types: place.types,
        openNow: place.opening_hours?.open_now
      }));
    } else {
      return [];
    }
    
  } catch (error) {
    console.error('Search healthcare facilities error:', error);
    throw new Error('Failed to search healthcare facilities: ' + error.message);
  }
}

/**
 * Get timezone information for coordinates
 * @param {number} latitude - Latitude coordinate
 * @param {number} longitude - Longitude coordinate
 * @returns {object} Timezone information
 */
async function getTimezone(latitude, longitude) {
  try {
    const timestamp = Math.floor(Date.now() / 1000);
    
    const response = await client.timezone({
      params: {
        location: { lat: latitude, lng: longitude },
        timestamp: timestamp,
        key: process.env.VITE_GOOGLE_MAPS_API_KEY || 'your_google_maps_key_here'
      }
    });

    if (response.data.status === 'OK') {
      return {
        timeZoneId: response.data.timeZoneId,
        timeZoneName: response.data.timeZoneName,
        rawOffset: response.data.rawOffset,
        dstOffset: response.data.dstOffset
      };
    } else {
      throw new Error('Timezone lookup failed');
    }
    
  } catch (error) {
    console.error('Get timezone error:', error);
    throw new Error('Failed to get timezone: ' + error.message);
  }
}

module.exports = {
  getGeocode,
  reverseGeocode,
  findNearbyHealthcare,
  getPlaceDetails,
  calculateDistance,
  getDirections,
  searchHealthcareFacilities,
  getTimezone
}; 