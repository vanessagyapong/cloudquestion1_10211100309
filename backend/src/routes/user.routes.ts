import express from "express";
import { authenticate } from "../middleware/auth";
import {
  getProfile,
  updateProfile,
  deleteProfile,
  changePassword,
  updateNotificationPreferences,
  becomeSeller,
} from "../controllers/user.controller";

const router = express.Router();

// Protected routes - all routes require authentication
router.use(authenticate);

router.get("/profile", getProfile);
router.put("/profile", updateProfile);
router.delete("/profile", deleteProfile);
router.put("/change-password", changePassword);
router.put("/notification-preferences", updateNotificationPreferences);
router.post("/become-seller", becomeSeller);

export default router;
