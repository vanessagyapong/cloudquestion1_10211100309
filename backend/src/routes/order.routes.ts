import express, { Router } from "express";
import {
  createOrder,
  getOrderById,
  getMyOrders,
  updateOrderStatus,
  updatePaymentStatus,
  getSellerOrders,
} from "../controllers/order.controller";
import { protect, authorize } from "../middleware/auth.middleware";

const router: Router = express.Router();

router.route("/").post(protect, createOrder);
router.route("/my-orders").get(protect, getMyOrders);
router.route("/seller").get(protect, authorize("seller"), getSellerOrders);
router.route("/:id").get(protect, getOrderById);
router
  .route("/:id/status")
  .put(protect, authorize("admin", "seller"), updateOrderStatus);
router.route("/:id/payment").put(protect, updatePaymentStatus);

export default router;
