import express, { Router } from "express";
import {
  createProduct,
  getStoreProducts,
  getProduct,
  updateProduct,
  deleteProduct,
  searchProducts,
  getAllProducts,
} from "../controllers/product.controller";
import { authenticate } from "../middleware/auth";
import { RequestHandler } from "express-serve-static-core";

const router: Router = express.Router();

/**
 * Public Routes
 * GET /api/products - Get all products
 * GET /api/products/search - Search products
 */
router.get("/", getAllProducts as unknown as RequestHandler);
router.get("/search", searchProducts as unknown as RequestHandler);

/**
 * Protected Routes (requires authentication)
 * GET /api/products/seller - Get all products for the authenticated seller's store
 * POST /api/products - Create a new product
 * PUT /api/products/:productId - Update a product
 * DELETE /api/products/:productId - Delete a product
 */
router.get(
  "/seller",
  authenticate as unknown as RequestHandler,
  getStoreProducts as unknown as RequestHandler
);
router.post(
  "/",
  authenticate as unknown as RequestHandler,
  createProduct as unknown as RequestHandler
);
router
  .route("/:productId")
  .get(
    authenticate as unknown as RequestHandler,
    getProduct as unknown as RequestHandler
  )
  .put(
    authenticate as unknown as RequestHandler,
    updateProduct as unknown as RequestHandler
  )
  .delete(
    authenticate as unknown as RequestHandler,
    deleteProduct as unknown as RequestHandler
  );

export default router;
