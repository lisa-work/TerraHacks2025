import { Router } from 'express';
import { reverseGeocode, getEmergencyFacilities } from '../controllers/locationController';

const router = Router();

router.get('/reverse-geocode', reverseGeocode);
router.get('/emergency', getEmergencyFacilities);

export default router;
