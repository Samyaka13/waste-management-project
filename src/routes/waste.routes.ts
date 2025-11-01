import { Router } from 'express';
import { getWasteAnalytics, getWasteHistory, logWaste } from '../controllers/waste.controller.js';
import { verifyJWT } from '../middlewares/auth.middleware.js';

const router = Router();

// --- Secured Routes ---

// This route will be called by the smart bin (or the mobile app)
// It requires the user to be logged in (via JWT)
router.route('/log').post(verifyJWT, logWaste);

// Get waste analytics data (for mobile app dashboard)
router.route('/analytics').get(getWasteAnalytics);

// Get paginated waste history (for mobile app feed)
router.route('/history').get(getWasteHistory);

export default router;
