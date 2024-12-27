import { Response } from "express";
import { AsyncRequestHandler, AuthenticatedRequest } from "../types/express";
import Store from "../models/store.model";
import User from "../models/user.model";

export const createStore: AsyncRequestHandler = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const { name, description } = req.body;

    // Check if user already has a store
    const existingStore = await Store.findOne({ owner: req.user?._id });
    if (existingStore) {
      return res.status(400).json({
        success: false,
        message: "You already have a store",
      });
    }

    // Create store with pending status
    const store = await Store.create({
      name,
      description,
      owner: req.user?._id,
      status: "pending",
      isActive: false, // Store starts as inactive until approved
      rating: 0,
      totalRatings: 0,
      totalSales: 0,
      balance: 0,
    });

    // Update user's role and seller status
    if (req.user?._id) {
      await User.findByIdAndUpdate(req.user._id, {
        role: "seller",
        sellerStatus: "pending",
        store: store._id, // Link store to user
      });
    }

    res.status(201).json({
      success: true,
      data: store,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

export const getStore: AsyncRequestHandler = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const store = await Store.findOne({ owner: req.user?._id });
    if (!store) {
      return res.status(404).json({
        success: false,
        message: "Store not found",
      });
    }

    res.json({
      success: true,
      data: store,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

export const updateStore: AsyncRequestHandler = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const { name, description } = req.body;
    const store = await Store.findOne({ owner: req.user?._id });

    if (!store) {
      return res.status(404).json({
        success: false,
        message: "Store not found",
      });
    }

    store.name = name || store.name;
    store.description = description || store.description;
    await store.save();

    res.json({
      success: true,
      data: store,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// Admin only
export const getAllStores: AsyncRequestHandler = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    if (req.user?.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Not authorized",
      });
    }

    const stores = await Store.find().populate("owner", "name email");
    res.json({
      success: true,
      data: stores,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// Admin only
export const updateStoreStatus: AsyncRequestHandler = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    if (req.user?.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Not authorized",
      });
    }

    const { storeId } = req.params;
    const { status } = req.body;

    const store = await Store.findById(storeId);
    if (!store) {
      return res.status(404).json({
        success: false,
        message: "Store not found",
      });
    }

    store.status = status;
    await store.save();

    // Update user's seller status
    await User.findByIdAndUpdate(store.owner, {
      sellerStatus: status,
    });

    res.json({
      success: true,
      data: store,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};
