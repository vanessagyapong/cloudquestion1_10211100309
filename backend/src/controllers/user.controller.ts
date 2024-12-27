import { Response } from "express";
import bcrypt from "bcryptjs";
import User from "../models/user.model";
import Store from "../models/store.model";
import { AuthenticatedRequest } from "../middleware/auth";
import { IUser } from "../types/user";

export const getProfile = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = await User.findById(req.user?._id)
      .select("-password")
      .populate([
        {
          path: "store",
          select:
            "name description status isActive logo banner contactEmail contactPhone address",
        },
        {
          path: "wishlist",
          select: "name description price images",
        },
        {
          path: "cart.items.product",
          select: "name description price images stock",
        },
      ]);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error("Get profile error:", error);
    res.status(500).json({
      success: false,
      message: "Error getting profile",
    });
  }
};

export const updateProfile = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const updates = req.body;

    // Don't allow password update through this endpoint
    delete updates.password;

    const user = await User.findByIdAndUpdate(
      req.user?._id,
      { $set: updates },
      { new: true, runValidators: true }
    ).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error("Update profile error:", error);
    res.status(500).json({
      success: false,
      message: "Error updating profile",
    });
  }
};

export const deleteProfile = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const user = await User.findByIdAndDelete(req.user?._id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.json({
      success: true,
      message: "Profile deleted successfully",
    });
  } catch (error) {
    console.error("Delete profile error:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting profile",
    });
  }
};

export const changePassword = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user?._id).select("+password");
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Check current password
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Current password is incorrect",
      });
    }

    // Update password
    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.json({
      success: true,
      message: "Password updated successfully",
    });
  } catch (error) {
    console.error("Change password error:", error);
    res.status(500).json({
      success: false,
      message: "Error changing password",
    });
  }
};

export const updateNotificationPreferences = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const { notifications } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user?._id,
      {
        $set: {
          "preferences.notifications": notifications,
        },
      },
      { new: true }
    ).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (!user.preferences?.notifications) {
      return res.status(400).json({
        success: false,
        message: "Notification preferences not found",
      });
    }

    res.json({
      success: true,
      data: user.preferences.notifications,
    });
  } catch (error) {
    console.error("Update notification preferences error:", error);
    res.status(500).json({
      success: false,
      message: "Error updating notification preferences",
    });
  }
};

export const becomeSeller = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const { name, description, contactEmail, contactPhone, address } = req.body;
    const user = req.user as IUser;

    // Validate required fields
    if (!name || !description) {
      return res.status(400).json({
        success: false,
        message: "Store name and description are required",
      });
    }

    // Check if user already has a store
    const existingStore = await Store.findOne({ owner: user._id });
    if (existingStore) {
      return res.status(400).json({
        success: false,
        message: "You already have a store",
      });
    }

    // Create store
    const store = await Store.create({
      name,
      description,
      owner: user._id,
      contactEmail: contactEmail || user.email,
      contactPhone,
      address,
      status: "pending",
      isActive: false,
    });

    // Update user role
    await User.findByIdAndUpdate(user._id, {
      $set: { role: "seller" },
    });

    res.status(201).json({
      success: true,
      data: store,
      message: "Store created successfully. Pending admin approval.",
    });
  } catch (error) {
    console.error("Become seller error:", error);
    res.status(500).json({
      success: false,
      message: "Error creating store",
      error:
        process.env.NODE_ENV === "development"
          ? (error as Error).message
          : undefined,
    });
  }
};
