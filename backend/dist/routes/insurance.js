"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = require("../middleware/auth");
const insuranceController_1 = require("../controllers/insuranceController");
const router = express_1.default.Router();
router.get('/search', insuranceController_1.searchInsuranceProviders);
router.get('/all', insuranceController_1.getAllInsuranceProviders);
router.get('/:id', insuranceController_1.getInsuranceProvider);
router.use(auth_1.protect);
router.post('/', insuranceController_1.createInsuranceProvider);
router.put('/:id', insuranceController_1.updateInsuranceProvider);
exports.default = router;
//# sourceMappingURL=insurance.js.map