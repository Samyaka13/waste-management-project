import { Router } from 'express';
import { logWaste } from '../controllers/waste.controller.js';
import { verifyJWT } from '../middlewares/auth.middleware.js';

const router = Router();

// --- Secured Routes ---

// This route will be called by the smart bin (or the mobile app)
// It requires the user to be logged in (via JWT)
router.route('/log').post(verifyJWT, logWaste);

export default router;
