import { Response } from "express";
import { AsyncRequestHandler, AuthenticatedRequest } from "../types/express";
import Store from "../models/store.model";
import User from "../models/user.model";
import Product from "../models/product.model";
import Order, { IOrder } from "../models/order.model";

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

    // Get store's products with full details
    const products = await Product.find({ store: store._id });
    const productIds = products.map((product) => product._id);

    // Get store's orders with detailed population
    const orders = await Order.find({
      "items.product": { $in: productIds },
    })
      .populate("user", "name email phone")
      .populate({
        path: "items.product",
        select: "name price images description category stock",
        model: "Product",
      })
      .sort({ createdAt: -1 });

    // Filter and enhance orders with additional details
    const filteredOrders = orders.map((order) => {
      // Filter out items where product exists and belongs to the store
      const storeItems = order.items.filter((item) => {
        const product = item.product;
        return product && productIds.some((id) => id.equals(product._id));
      });

      const orderTotal = storeItems.reduce(
        (sum, item) => sum + (item.price || 0) * item.quantity,
        0
      );

      const orderDoc = order.toObject();
      return {
        ...orderDoc,
        items: storeItems,
        orderDetails: {
          id: orderDoc._id,
          createdAt: orderDoc.createdAt,
          updatedAt: orderDoc.updatedAt,
          status: orderDoc.status,
          paymentStatus: orderDoc.paymentStatus,
          paymentMethod: orderDoc.paymentMethod,
          trackingNumber: orderDoc.trackingNumber,
          estimatedDeliveryDate: orderDoc.estimatedDeliveryDate,
          actualDeliveryDate: orderDoc.actualDeliveryDate,
          storeTotal: orderTotal,
        },
        customer: orderDoc.user,
        shippingAddress: orderDoc.shippingAddress,
        statusHistory: orderDoc.statusHistory,
      };
    });

    // Group orders by status for better organization
    const ordersByStatus = filteredOrders.reduce((acc: any, order) => {
      if (!acc[order.status]) {
        acc[order.status] = [];
      }
      acc[order.status].push(order);
      return acc;
    }, {});

    // Calculate analytics
    const analytics = {
      overview: {
        totalOrders: filteredOrders.length,
        totalRevenue: filteredOrders.reduce(
          (total, order) => total + order.orderDetails.storeTotal,
          0
        ),
        averageOrderValue:
          filteredOrders.length > 0
            ? filteredOrders.reduce(
                (total, order) => total + order.orderDetails.storeTotal,
                0
              ) / filteredOrders.length
            : 0,
      },
      ordersByStatus: Object.keys(ordersByStatus).reduce((acc: any, status) => {
        acc[status] = ordersByStatus[status].length;
        return acc;
      }, {}),
      recentOrders: filteredOrders.slice(0, 5),
      productPerformance: productIds.reduce((acc: any, productId) => {
        const productOrders = filteredOrders.filter((order) =>
          order.items.some(
            (item) =>
              item.product &&
              item.product._id &&
              item.product._id.equals(productId)
          )
        );
        const product = products.find((p) => p._id.equals(productId));
        if (product) {
          acc[product.name] = {
            totalOrders: productOrders.length,
            totalQuantity: productOrders.reduce((total, order) => {
              const item = order.items.find(
                (i) =>
                  i.product && i.product._id && i.product._id.equals(productId)
              );
              return total + (item?.quantity || 0);
            }, 0),
            totalRevenue: productOrders.reduce((total, order) => {
              const item = order.items.find(
                (i) =>
                  i.product && i.product._id && i.product._id.equals(productId)
              );
              return (
                total + (item ? (item.price || 0) * (item.quantity || 0) : 0)
              );
            }, 0),
            inStock: product.stock,
          };
        }
        return acc;
      }, {}),
      timeBasedAnalysis: {
        daily: getDailyOrderStats(filteredOrders),
        monthly: getMonthlyOrderStats(filteredOrders),
      },
    };

    res.json({
      success: true,
      data: {
        store,
        products,
        orders: {
          all: filteredOrders,
          byStatus: ordersByStatus,
        },
        analytics,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// Helper function to get daily order statistics
function getDailyOrderStats(
  orders: Array<{ orderDetails: { createdAt: Date; storeTotal: number } }>
) {
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - i);
    return date.toISOString().split("T")[0];
  });

  return last7Days.reduce((acc: any, date) => {
    const dayOrders = orders.filter(
      (order) =>
        new Date(order.orderDetails.createdAt).toISOString().split("T")[0] ===
        date
    );
    acc[date] = {
      orders: dayOrders.length,
      revenue: dayOrders.reduce(
        (sum: number, order) => sum + order.orderDetails.storeTotal,
        0
      ),
    };
    return acc;
  }, {});
}

// Helper function to get monthly order statistics
function getMonthlyOrderStats(
  orders: Array<{ orderDetails: { createdAt: Date; storeTotal: number } }>
) {
  const last6Months = Array.from({ length: 6 }, (_, i) => {
    const date = new Date();
    date.setMonth(date.getMonth() - i);
    return date.toISOString().slice(0, 7);
  });

  return last6Months.reduce((acc: any, monthYear) => {
    const monthOrders = orders.filter(
      (order) =>
        new Date(order.orderDetails.createdAt).toISOString().slice(0, 7) ===
        monthYear
    );
    acc[monthYear] = {
      orders: monthOrders.length,
      revenue: monthOrders.reduce(
        (sum: number, order) => sum + order.orderDetails.storeTotal,
        0
      ),
    };
    return acc;
  }, {});
}

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
