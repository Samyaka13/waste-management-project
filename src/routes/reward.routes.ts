import { Router } from 'express';
import {
  createReward,
  listActiveRewards,
  redeemReward,
} from '../controllers/reward.controller.js';
import { verifyJWT } from '../middlewares/auth.middleware.js';
import { verifyRole } from '../middlewares/role.middleware.js';

const router = Router();

// --- All reward routes require a user to be logged in ---
router.use(verifyJWT);

// --- Admin Only Routes ---
// POST /api/v1/rewards/create
router
  .route('/create')
  .post(verifyRole(['ADMIN']), createReward);

// --- User Routes ---
// GET /api/v1/rewards/
router.route('/').get(listActiveRewards);

// POST /api/v1/rewards/redeem/:rewardId
router.route('/redeem/:rewardId').post(redeemReward);

export default router;