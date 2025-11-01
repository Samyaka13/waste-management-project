
import { Router } from 'express';
import { getCurrentUser, loginUser, logoutUser, registerUser } from '../controllers/user.controller.js';
import { upload } from '../middlewares/multer.middleware.js';
import { verifyJWT } from '../middlewares/auth.middleware.js';

const router = Router();

// --- User Registration Route ---
// POST /api/v1/users/register
router.route('/register').post(
  upload.single('avatar'),
  registerUser
);

router.route('/login').post(loginUser);

// --- Secured Routes (Require JWT) ---

// Logout User: POST /api/v1/users/logout
router.route('/logout').post(verifyJWT, logoutUser);
router.route('/me').post(verifyJWT, getCurrentUser);

export default router;
