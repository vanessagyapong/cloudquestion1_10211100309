import express, { Router } from "express";
import {
  createStore,
  getStore,
  updateStore,
  getAllStores,
  updateStoreStatus,
} from "../controllers/store.controller";
import { protect } from "../middleware/auth.middleware";

const router: Router = express.Router();

// Protected routes
router.post("/", protect, createStore);
router.get("/my-store", protect, getStore);
router.put("/my-store", protect, updateStore);

// Admin routes
router.get("/", protect, getAllStores);
router.put("/:storeId/status", protect, updateStoreStatus);

export default router;
