import express from "express";
import { protect } from "../middleware/auth.middleware";
import {
  getWishlist,
  toggleWishlist,
  removeFromWishlist,
} from "../controllers/wishlist.controller";

const router = express.Router();

router.get("/", protect, getWishlist);
router.post("/:productId", protect, toggleWishlist);
router.delete("/:productId", protect, removeFromWishlist);

export default router;
