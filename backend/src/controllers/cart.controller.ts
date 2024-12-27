import { Response } from "express";
import { AsyncRequestHandler, AuthenticatedRequest } from "../types/express";
import Cart from "../models/cart.model";
import Product from "../models/product.model";

export const getCart: AsyncRequestHandler = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const cart = await Cart.findOne({ user: req.user?._id }).populate(
      "items.product"
    );
    res.json({
      success: true,
      data: cart?.items || [],
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Error fetching cart",
    });
  }
};

export const addToCart: AsyncRequestHandler = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const { productId, quantity } = req.body;

    // Fetch product to get price
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    let cart = await Cart.findOne({ user: req.user?._id });

    if (!cart) {
      cart = await Cart.create({
        user: req.user?._id,
        items: [{ product: productId, quantity, price: product.price }],
      });
    } else {
      const existingItem = cart.items.find(
        (item) => item.product.toString() === productId
      );

      if (existingItem) {
        existingItem.quantity += quantity;
        existingItem.price = product.price; // Update price in case it changed
      } else {
        cart.items.push({ product: productId, quantity, price: product.price });
      }
      await cart.save();
    }

    // Populate product details
    await cart.populate("items.product");

    res.json({
      success: true,
      data: cart,
    });
  } catch (error) {
    console.error("Add to cart error:", error);
    res.status(500).json({
      success: false,
      message: "Error adding to cart",
      error:
        process.env.NODE_ENV === "development"
          ? (error as Error).message
          : undefined,
    });
  }
};

export const updateCart: AsyncRequestHandler = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<any> => {
  try {
    const { quantity } = req.body;
    const cart = await Cart.findOne({ user: req.user?._id });

    if (!cart) {
      return res.status(404).json({
        success: false,
        message: "Cart not found",
      });
    }

    const item = cart.items.find(
      (item) => item.product.toString() === req.params.productId
    );

    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Item not found in cart",
      });
    }

    item.quantity = quantity;
    await cart.save();

    return res.json({
      success: true,
      data: cart.items,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Error updating cart",
    });
  }
};

export const removeFromCart: AsyncRequestHandler = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<any> => {
  try {
    const cart = await Cart.findOne({ user: req.user?._id });

    if (!cart) {
      return res.status(404).json({
        success: false,
        message: "Cart not found",
      });
    }

    cart.items = cart.items.filter(
      (item) => item.product.toString() !== req.params.productId
    );
    await cart.save();

    return res.json({
      success: true,
      data: cart.items,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Error removing from cart",
    });
  }
};
