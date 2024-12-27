import { Response } from "express";
import { AsyncRequestHandler, AuthenticatedRequest } from "../types/express";
import Product from "../models/product.model";
import Store from "../models/store.model";

// Create a new product
export const createProduct: AsyncRequestHandler = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    // First, check if user has an approved store
    const store = await Store.findOne({
      owner: req.user?._id,
      status: "approved",
    });

    if (!store) {
      return res.status(403).json({
        success: false,
        message: "You need an approved store to create products",
      });
    }

    const { name, description, price, stock, category, images } = req.body;

    // Generate SKU
    const count = await Product.countDocuments();
    const sku = `SKU-${store._id}-${count + 1}`;

    const product = await Product.create({
      name,
      description,
      price,
      stock,
      category,
      images: images.split(",next,"),
      store: store._id,
      sku,
    });

    res.status(201).json({
      success: true,
      data: product,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// Get all products for a store
export const getStoreProducts: AsyncRequestHandler = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    // Check if user is a seller
    if (req.user?.role !== "seller") {
      return res.status(403).json({
        success: false,
        message: "Only sellers can access their store products",
      });
    }

    // Find the store for the seller
    const store = await Store.findOne({ owner: req.user._id });
    if (!store) {
      return res.status(404).json({
        success: false,
        message: "Store not found. Please create a store first.",
      });
    }

    // Check if store is approved
    if (store.status !== "approved") {
      return res.status(403).json({
        success: false,
        message: "Your store is not approved yet",
      });
    }

    // Get all products for the store
    const products = await Product.find({
      store: store._id,
      isActive: true,
    }).sort({ createdAt: -1 });

    res.json({
      success: true,
      count: products.length,
      data: products,
    });
  } catch (error) {
    console.error("Get store products error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching store products",
      error:
        process.env.NODE_ENV === "development"
          ? (error as Error).message
          : undefined,
    });
  }
};

// Get a single product
export const getProduct: AsyncRequestHandler = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const { productId } = req.params;
    const product = await Product.findById(productId).populate(
      "store",
      "name logo rating isActive status"
    );

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    res.json({
      success: true,
      data: product,
    });
  } catch (error) {
    res.status(500).json({ message: "Error fetching product" });
  }
};

// Update a product
export const updateProduct: AsyncRequestHandler = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const { productId } = req.params;
    const updates = req.body;

    // Verify ownership
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    const store = await Store.findById(product.store);
    if (!store || store.owner.toString() !== req.user?._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Not authorized",
      });
    }

    // Update product
    const updatedProduct = await Product.findByIdAndUpdate(
      productId,
      { ...updates, images: updates.images.split(",next,") },
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      data: updatedProduct,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// Delete a product
export const deleteProduct: AsyncRequestHandler = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const { productId } = req.params;

    // Verify ownership
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    const store = await Store.findById(product.store);
    if (!store || store.owner.toString() !== req.user?._id.toString()) {
      console.log(
        `user ${
          req.user?._id
        } store ${store?.owner.toString()} is not authorized to delete product ${productId}`
      );
      return res.status(403).json({
        success: false,
        message: "Not authorized",
      });
    }

    await product.deleteOne();

    res.json({
      success: true,
      message: "Product deleted",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// Search products
export const searchProducts: AsyncRequestHandler = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const { query, category } = req.query;
    const filter: any = { isActive: true };

    if (query) {
      filter.$text = { $search: query as string };
    }
    if (category) {
      filter.category = category;
    }

    const products = await Product.find(filter)
      .populate("store", "name logo rating isActive status")
      .sort({ createdAt: -1 });
    res.json({ data: products });
  } catch (error) {
    res.status(500).json({ message: "Error searching products" });
  }
};

// Get all products
export const getAllProducts = async (req: Request, res: Response) => {
  try {
    const products = await Product.find({ isActive: true })
      .populate("store", "name logo rating isActive status")
      .sort({ createdAt: -1 });
    res.json({ data: products });
  } catch (error) {
    res.status(500).json({ message: "Error fetching products" });
  }
};
