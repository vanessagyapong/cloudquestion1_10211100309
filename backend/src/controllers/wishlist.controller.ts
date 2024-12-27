import { Response } from "express";
import { AsyncRequestHandler, AuthenticatedRequest } from "../types/express";
import User from "../models/user.model";
import { Types } from "mongoose";
import { IProduct } from "../types/product";
import { IUser } from "../types/user";

export const getWishlist: AsyncRequestHandler = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const user = await User.findById(req.user?._id).populate<{
      wishlist: IProduct[];
    }>("wishlist");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.json({
      success: true,
      data: user.wishlist || [],
    });
  } catch (error) {
    console.error("Get wishlist error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching wishlist",
      error:
        process.env.NODE_ENV === "development"
          ? (error as Error).message
          : undefined,
    });
  }
};

export const toggleWishlist: AsyncRequestHandler = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const productId = req.params.productId;
    const user = (await User.findById(req.user?._id)) as IUser;

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Convert wishlist to array of ObjectId strings for comparison
    const wishlistIds = (user.wishlist as Types.ObjectId[]).map((id) =>
      id.toString()
    );
    const exists = wishlistIds.includes(productId);

    if (exists) {
      // Remove from wishlist
      user.wishlist = (user.wishlist as Types.ObjectId[]).filter(
        (id) => id.toString() !== productId
      );
    } else {
      // Add to wishlist
      (user.wishlist as Types.ObjectId[]) = [
        ...(user.wishlist as Types.ObjectId[]),
        new Types.ObjectId(productId),
      ];
    }
    await user.save();

    // Populate wishlist before sending response
    await user.populate<{ wishlist: IProduct[] }>("wishlist");

    res.json({
      success: true,
      data: user.wishlist,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Error updating wishlist",
    });
  }
};

export const removeFromWishlist: AsyncRequestHandler = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const productId = req.params.productId;
    const user = (await User.findById(req.user?._id)) as IUser;

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Convert wishlist to array of ObjectId strings for comparison
    const wishlistIds = (user.wishlist as Types.ObjectId[]).map((id) =>
      id.toString()
    );
    const exists = wishlistIds.includes(productId);

    if (!exists) {
      return res.status(404).json({
        success: false,
        message: "Product not found in wishlist",
      });
    }

    // Remove from wishlist
    user.wishlist = (user.wishlist as Types.ObjectId[]).filter(
      (id) => id.toString() !== productId
    );
    await user.save();

    // Populate wishlist before sending response
    await user.populate<{ wishlist: IProduct[] }>("wishlist");

    res.json({
      success: true,
      data: user.wishlist,
    });
  } catch (error) {
    console.error("Remove from wishlist error:", error);
    res.status(500).json({
      success: false,
      message: "Error removing from wishlist",
      error:
        process.env.NODE_ENV === "development"
          ? (error as Error).message
          : undefined,
    });
  }
};
