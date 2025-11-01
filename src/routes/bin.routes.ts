import { Router } from 'express';
import {
  getMyBinDetails,
  updateBinStatus,
} from '../controllers/bin.controller.js';
import { verifyJWT } from '../middlewares/auth.middleware.js';

const router = Router();

// --- Secured Route (For Mobile App) ---
router.route('/my-bin').get(verifyJWT, getMyBinDetails);

// --- Public/Hardware Route (For Smart Bin) ---
// You might add a separate API key middleware here later
router.route('/update-status').post(updateBinStatus);

export default router;
