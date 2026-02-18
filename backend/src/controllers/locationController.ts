import { Request, Response, NextFunction } from 'express';
import mapsService from '../services/mapsService';

// Get coordinates from address string
export const geocodeAddress = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { address } = req.query;
    if (!address) {
      return res.status(400).json({ success: false, error: 'address is required' });
    }

    const location = await mapsService.geocodeAddress(address as string);
    if (!location) {
      return res.status(404).json({ success: false, error: 'Address not found' });
    }

    return res.status(200).json({ success: true, location });
  } catch (error) {
    next(error);
  }
};

// Get human readable address from coordinates
export const reverseGeocode = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { lat, lng } = req.query;
    if (!lat || !lng) {
      return res.status(400).json({ success: false, error: 'lat and lng are required' });
    }

    const address = await mapsService.reverseGeocode(parseFloat(lat as string), parseFloat(lng as string));
    return res.status(200).json({ success: true, address });
  } catch (error) {
    next(error);
  }
};

// Find nearby emergency facilities (hospitals or urgent care) around coordinates
export const getEmergencyFacilities = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { lat, lng } = req.query;
    if (!lat || !lng) {
      return res.status(400).json({ success: false, error: 'lat and lng are required' });
    }

    const location = {
      lat: parseFloat(lat as string),
      lng: parseFloat(lng as string)
    };

    const places = await mapsService.findNearbyPlaces({
      location,
      radius: 10000,
      type: 'hospital',
      keyword: 'emergency'
    });

    const facilities = await Promise.all(places.slice(0, 5).map(async place => {
      let phone = '';
      try {
        const details = await mapsService.getPlaceDetails(place.placeId);
        phone = details.phone || '';
      } catch (err) {
        // ignore
      }

      const distanceKm = mapsService.calculateDistance(location.lat, location.lng, place.location.lat, place.location.lng);
      const eta = Math.round((distanceKm / 50) * 60); // assume 50km/h average speed

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
  } catch (error) {
    next(error);
  }
};

