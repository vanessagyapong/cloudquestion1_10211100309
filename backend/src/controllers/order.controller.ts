import { Request, Response } from "express";
import { AsyncRequestHandler, AuthenticatedRequest } from "../types/express";
import Order from "../models/order.model";
import Product from "../models/product.model";
import Store from "../models/store.model";

export const createOrder = async (req: Request, res: Response) => {
  try {
    const { items, shippingAddress, paymentMethod } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ message: "No order items" });
    }

    // Verify stock and get prices
    const itemsWithPrices = await Promise.all(
      items.map(async (item: { product: string; quantity: number }) => {
        const product = await Product.findById(item.product);
        if (!product) {
          throw new Error("Product not found");
        }
        if (product.stock < item.quantity) {
          throw new Error(`Not enough stock for ${product.name}`);
        }
        return {
          product: item.product,
          quantity: item.quantity,
          price: product.price,
        };
      })
    );

    // Calculate estimated delivery date (7 days from now)
    const estimatedDeliveryDate = new Date();
    estimatedDeliveryDate.setDate(estimatedDeliveryDate.getDate() + 7);

    // Create order
    const order = await Order.create({
      user: (req as any).user._id,
      items: itemsWithPrices,
      shippingAddress,
      paymentMethod,
      estimatedDeliveryDate,
      statusHistory: [{ status: "pending", timestamp: new Date() }],
    });

    // Update stock
    await Promise.all(
      items.map(async (item: { product: string; quantity: number }) => {
        const product = await Product.findById(item.product);
        if (product) {
          product.stock -= item.quantity;
          await product.save();
        }
      })
    );

    res.status(201).json(order);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: (error as Error).message || "Server error" });
  }
};

export const getOrderById = async (req: Request, res: Response) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate("user", "name email")
      .populate("items.product", "name imageUrl");

    if (order) {
      if (order.user._id.toString() !== (req as any).user._id.toString()) {
        return res
          .status(403)
          .json({ message: "Not authorized to view this order" });
      }
      res.json(order);
    } else {
      res.status(404).json({ message: "Order not found" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getMyOrders = async (req: Request, res: Response) => {
  try {
    const { status } = req.query;
    const query: any = { user: (req as any).user._id };

    if (status) {
      query.status = status;
    }

    const orders = await Order.find(query)
      .populate("items.product", "name imageUrl")
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

export const updateOrderStatus = async (req: Request, res: Response) => {
  try {
    const { status, note, trackingNumber } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Update status
    order.status = status;

    // Add tracking number if provided
    if (trackingNumber) {
      order.trackingNumber = trackingNumber;
    }

    // Handle special status cases
    switch (status) {
      case "delivered":
        order.actualDeliveryDate = new Date();
        break;
      case "cancelled":
        order.cancellationReason = note;
        break;
      case "returned":
        order.returnReason = note;
        break;
    }

    // Add note to status history if provided
    if (note) {
      order.statusHistory.push({
        status,
        timestamp: new Date(),
        note,
      });
    }

    const updatedOrder = await order.save();
    res.json(updatedOrder);
  } catch (error) {
    console.error(error);
    if ((error as Error).message.includes("Invalid status transition")) {
      res.status(400).json({ message: (error as Error).message });
    } else {
      res.status(500).json({ message: "Server error" });
    }
  }
};

export const updatePaymentStatus = async (req: Request, res: Response) => {
  try {
    const { paymentStatus, note } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    order.paymentStatus = paymentStatus;

    // Update order status based on payment status
    if (paymentStatus === "completed" && order.status === "pending") {
      order.status = "confirmed";
      order.statusHistory.push({
        status: "confirmed",
        timestamp: new Date(),
        note: "Payment completed",
      });
    }

    const updatedOrder = await order.save();
    res.json(updatedOrder);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getSellerOrders: AsyncRequestHandler = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const { status } = req.query;

    // First, get the seller's store
    const store = await Store.findOne({ owner: req.user?._id });
    if (!store) {
      return res.status(404).json({
        success: false,
        message: "Store not found",
      });
    }

    // Get all products from the store
    const products = await Product.find({ store: store._id });
    const productIds = products.map((product) => product._id);

    // Build query
    const query: any = { "items.product": { $in: productIds } };
    if (status) {
      query.status = status;
    }

    // Get all orders that contain products from the store
    const orders = await Order.find(query)
      .populate("user", "name email")
      .populate("items.product", "name price images")
      .sort({ createdAt: -1 });

    // Filter out items that don't belong to the store
    const filteredOrders = orders.map((order) => ({
      ...order.toObject(),
      items: order.items.filter((item) =>
        productIds.some((id) => id.equals(item.product._id))
      ),
    }));

    // Group orders by status for analytics
    const ordersByStatus = filteredOrders.reduce((acc: any, order) => {
      acc[order.status] = (acc[order.status] || 0) + 1;
      return acc;
    }, {});

    res.json({
      success: true,
      count: filteredOrders.length,
      analytics: {
        ordersByStatus,
      },
      data: filteredOrders,
    });
  } catch (error) {
    console.error("Get seller orders error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching seller orders",
      error:
        process.env.NODE_ENV === "development"
          ? (error as Error).message
          : undefined,
    });
  }
};
