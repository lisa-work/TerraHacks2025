import { Router } from 'express';
import { geocodeAddress, reverseGeocode, getEmergencyFacilities } from '../controllers/locationController';

const router = Router();

router.get('/geocode', geocodeAddress);
router.get('/reverse-geocode', reverseGeocode);
router.get('/emergency', getEmergencyFacilities);

export default router;
