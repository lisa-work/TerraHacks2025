"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const locationController_1 = require("../controllers/locationController");
const router = (0, express_1.Router)();
router.get('/geocode', locationController_1.geocodeAddress);
router.get('/reverse-geocode', locationController_1.reverseGeocode);
router.get('/emergency', locationController_1.getEmergencyFacilities);
exports.default = router;
//# sourceMappingURL=location.js.map