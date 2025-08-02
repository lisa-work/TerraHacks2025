import { Request, Response, NextFunction } from 'express';
import Clinic from '../models/Clinic';
import mapsService from '../services/mapsService';
import { AuthRequest } from '../middleware/auth';
import { setCache, getCache } from '../config/redis';

// @desc    Search clinics
// @route   GET /api/clinics/search
// @access  Public
export const searchClinics = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const {
      location,
      lat,
      lng,
      radius = 50, // Default 50km radius
      type,
      specialty,
      insurance,
      emergencyServices,
      telemedicine,
      rating,
      sortBy = 'distance',
      page = 1,
      limit = 20
    } = req.query;

    let searchLat: number | undefined;
    let searchLng: number | undefined;

    // Get coordinates from location string or use provided lat/lng
    if (location && typeof location === 'string') {
      const locationData = await mapsService.geocodeAddress(location);
      if (locationData) {
        searchLat = locationData.lat;
        searchLng = locationData.lng;
      }
    } else if (lat && lng) {
      searchLat = parseFloat(lat as string);
      searchLng = parseFloat(lng as string);
    }

    // Build search query
    let query: any = {
      isActive: true,
      isVerified: true
    };

    // Location-based search
    if (searchLat && searchLng) {
      const radiusKm = parseFloat(radius as string);
      const latRange = radiusKm / 111; // Rough conversion: 1 degree ≈ 111km
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

    // Filter by type
    if (type) {
      query.type = type;
    }

    // Filter by specialty
    if (specialty) {
      query.specialties = { $in: Array.isArray(specialty) ? specialty : [specialty] };
    }

    // Filter by insurance
    if (insurance) {
      query.insuranceAccepted = { $in: Array.isArray(insurance) ? insurance : [insurance] };
    }

    // Filter by emergency services
    if (emergencyServices === 'true') {
      query.emergencyServices = true;
    }

    // Filter by telemedicine
    if (telemedicine === 'true') {
      query.telemedicineAvailable = true;
    }

    // Filter by rating
    if (rating) {
      query.rating = { $gte: parseFloat(rating as string) };
    }

    // Pagination
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    // Execute search
    let clinics = await Clinic.find(query)
      .skip(skip)
      .limit(limitNum)
      .lean();

    // Calculate distances if location is provided
    if (searchLat && searchLng) {
      clinics = clinics.map(clinic => {
        const distance = mapsService.calculateDistance(
          searchLat!,
          searchLng!,
          clinic.location.lat,
          clinic.location.lng
        );
        return {
          ...clinic,
          distance: Math.round(distance * 10) / 10 // Round to 1 decimal place
        };
      });

      // Sort by distance if requested
      if (sortBy === 'distance') {
        clinics.sort((a, b) => (a.distance || 0) - (b.distance || 0));
      }
    }

    // Sort by other criteria
    if (sortBy === 'rating') {
      clinics.sort((a, b) => b.rating - a.rating);
    } else if (sortBy === 'name') {
      clinics.sort((a, b) => a.name.localeCompare(b.name));
    }

    // Get total count for pagination
    const total = await Clinic.countDocuments(query);

    // Cache results for 10 minutes
    const cacheKey = `clinic_search_${JSON.stringify({ location, lat, lng, radius, type, specialty, insurance })}_${pageNum}`;
    await setCache(cacheKey, { clinics, total }, 600);

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
  } catch (error) {
    next(error);
  }
};

// @desc    Get clinic by ID
// @route   GET /api/clinics/:id
// @access  Public
export const getClinic = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    // Try cache first
    const cacheKey = `clinic_${id}`;
    let clinic = await getCache(cacheKey);

    if (!clinic) {
      clinic = await Clinic.findById(id);
      
      if (!clinic) {
        return res.status(404).json({
          success: false,
          error: 'Clinic not found'
        });
      }

      // Cache for 1 hour
      await setCache(cacheKey, clinic, 3600);
    }

    res.status(200).json({
      success: true,
      clinic
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get clinic availability
// @route   GET /api/clinics/:id/availability
// @access  Public
export const getClinicAvailability = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { date, duration = 30 } = req.query;

    const clinic = await Clinic.findById(id);
    
    if (!clinic) {
      return res.status(404).json({
        success: false,
        error: 'Clinic not found'
      });
    }

    // Get the requested date or default to today
    const requestedDate = date ? new Date(date as string) : new Date();
    const dayOfWeek = requestedDate.toLocaleDateString('en-US', { weekday: 'long' });

    // Find operating hours for the day
    const operatingHours = clinic.operatingHours.find(hours => hours.day === dayOfWeek);
    
    if (!operatingHours || !operatingHours.isOpen) {
      return res.status(200).json({
        success: true,
        availableSlots: [],
        message: 'Clinic is closed on this day'
      });
    }

    // Generate available time slots
    const slots = generateTimeSlots(
      operatingHours.open,
      operatingHours.close,
      parseInt(duration as string)
    );

    // TODO: Filter out already booked slots by checking appointments
    // This would require querying the Appointment model

    res.status(200).json({
      success: true,
      availableSlots: slots,
      operatingHours: {
        open: operatingHours.open,
        close: operatingHours.close
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get nearby clinics
// @route   GET /api/clinics/nearby
// @access  Public
export const getNearbyClinicsByLocation = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { lat, lng, radius = 25, limit = 10 } = req.query;

    if (!lat || !lng) {
      return res.status(400).json({
        success: false,
        error: 'Latitude and longitude are required'
      });
    }

    const searchLat = parseFloat(lat as string);
    const searchLng = parseFloat(lng as string);
    const radiusKm = parseFloat(radius as string);

    // Build location query
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

    let clinics = await Clinic.find(query)
      .limit(parseInt(limit as string))
      .lean();

    // Calculate distances and sort
    clinics = clinics.map(clinic => {
      const distance = mapsService.calculateDistance(
        searchLat,
        searchLng,
        clinic.location.lat,
        clinic.location.lng
      );
      return {
        ...clinic,
        distance: Math.round(distance * 10) / 10
      };
    }).sort((a, b) => (a.distance || 0) - (b.distance || 0));

    res.status(200).json({
      success: true,
      clinics
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get clinic specialties
// @route   GET /api/clinics/specialties
// @access  Public
export const getSpecialties = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Try cache first
    const cacheKey = 'clinic_specialties';
    let specialties = await getCache(cacheKey);

    if (!specialties) {
      // Get unique specialties from all clinics
      const result = await Clinic.aggregate([
        { $match: { isActive: true } },
        { $unwind: '$specialties' },
        { $group: { _id: '$specialties', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $project: { specialty: '$_id', count: 1, _id: 0 } }
      ]);

      specialties = result;
      
      // Cache for 1 hour
      await setCache(cacheKey, specialties, 3600);
    }

    res.status(200).json({
      success: true,
      specialties
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get insurance providers
// @route   GET /api/clinics/insurance-providers
// @access  Public
export const getInsuranceProviders = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Try cache first
    const cacheKey = 'insurance_providers';
    let providers = await getCache(cacheKey);

    if (!providers) {
      // Get unique insurance providers from all clinics
      const result = await Clinic.aggregate([
        { $match: { isActive: true } },
        { $unwind: '$insuranceAccepted' },
        { $group: { _id: '$insuranceAccepted', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $project: { provider: '$_id', count: 1, _id: 0 } }
      ]);

      providers = result;
      
      // Cache for 1 hour
      await setCache(cacheKey, providers, 3600);
    }

    res.status(200).json({
      success: true,
      providers
    });
  } catch (error) {
    next(error);
  }
};

// Helper function to generate time slots
const generateTimeSlots = (openTime: string, closeTime: string, duration: number): string[] => {
  const slots: string[] = [];
  
  // Parse open and close times
  const [openHour, openMinute] = openTime.split(':').map(Number);
  const [closeHour, closeMinute] = closeTime.split(':').map(Number);
  
  // Create start and end time objects
  const startTime = new Date();
  startTime.setHours(openHour, openMinute, 0, 0);
  
  const endTime = new Date();
  endTime.setHours(closeHour, closeMinute, 0, 0);
  
  // Generate slots
  const currentTime = new Date(startTime);
  
  while (currentTime < endTime) {
    const timeString = currentTime.toTimeString().slice(0, 5); // HH:MM format
    slots.push(timeString);
    
    // Add duration in minutes
    currentTime.setMinutes(currentTime.getMinutes() + duration);
  }
  
  return slots;
};