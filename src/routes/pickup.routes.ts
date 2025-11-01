import { Router } from 'express';
import {
  findNearbyFullBins,
  requestBinPickup,
} from '../controllers/pickup.controller.js';
import { verifyJWT } from '../middlewares/auth.middleware.js';
import { verifyRole } from '../middlewares/role.middleware.js'; // <-- 1. Import new middleware

const router = Router();

// --- Apply JWT and Role-Based Access Control ---
// Only logged-in users who are 'WASTE_PICKER's can access these routes
router.use(verifyJWT, verifyRole(['WASTE_PICKER', 'ADMIN']));

// --- Routes ---

// Find bins near the waste picker's location
// (e.g., GET /api/v1/pickup/nearby-bins?long=-73.96&lat=40.78)
router.route('/nearby-bins').get(findNearbyFullBins);

// Book a pickup for a specific bin
router.route('/request').post(requestBinPickup);

export default router;
