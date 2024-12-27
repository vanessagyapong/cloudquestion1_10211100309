import express from "express";
import { protect } from "../middleware/auth.middleware";
import { 
  getCart, 
  addToCart, 
  updateCart, 
  removeFromCart 
} from "../controllers/cart.controller";

const router = express.Router();

router.get("/", protect, getCart);
router.post("/", protect, addToCart);
router.put("/:productId", protect, updateCart);
router.delete("/:productId", protect, removeFromCart);

export default router; 