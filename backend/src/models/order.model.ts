import mongoose from "mongoose";

export interface IOrder extends mongoose.Document {
  user: mongoose.Types.ObjectId;
  items: {
    product: mongoose.Types.ObjectId;
    quantity: number;
    price: number;
  }[];
  totalAmount: number;
  shippingAddress: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  status:
    | "pending"
    | "confirmed"
    | "processing"
    | "packed"
    | "shipped"
    | "out_for_delivery"
    | "delivered"
    | "cancelled"
    | "returned"
    | "refunded";
  statusHistory: {
    status: string;
    timestamp: Date;
    note?: string;
  }[];
  paymentStatus: "pending" | "processing" | "completed" | "failed" | "refunded";
  paymentMethod: string;
  estimatedDeliveryDate?: Date;
  actualDeliveryDate?: Date;
  trackingNumber?: string;
  cancellationReason?: string;
  returnReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    items: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
          min: 1,
        },
        price: {
          type: Number,
          required: true,
          min: 0,
        },
      },
    ],
    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    shippingAddress: {
      street: {
        type: String,
        required: true,
      },
      city: {
        type: String,
        required: true,
      },
      state: {
        type: String,
        required: true,
      },
      zipCode: {
        type: String,
        required: true,
      },
      country: {
        type: String,
        required: true,
      },
    },
    status: {
      type: String,
      enum: [
        "pending",
        "confirmed",
        "processing",
        "packed",
        "shipped",
        "out_for_delivery",
        "delivered",
        "cancelled",
        "returned",
        "refunded",
      ],
      default: "pending",
    },
    statusHistory: [
      {
        status: {
          type: String,
          required: true,
        },
        timestamp: {
          type: Date,
          default: Date.now,
        },
        note: String,
      },
    ],
    paymentStatus: {
      type: String,
      enum: ["pending", "processing", "completed", "failed", "refunded"],
      default: "pending",
    },
    paymentMethod: {
      type: String,
      required: true,
    },
    estimatedDeliveryDate: Date,
    actualDeliveryDate: Date,
    trackingNumber: String,
    cancellationReason: String,
    returnReason: String,
  },
  {
    timestamps: true,
  }
);

// Calculate total amount before saving
orderSchema.pre("save", function (next) {
  this.totalAmount = this.items.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  // Add status change to history if status changed
  if (this.isModified("status")) {
    this.statusHistory.push({
      status: this.status,
      timestamp: new Date(),
    });
  }

  next();
});

// Validate status transitions
orderSchema.pre("save", function (next) {
  if (this.isModified("status")) {
    const validTransitions: { [key: string]: string[] } = {
      pending: ["confirmed", "cancelled"],
      confirmed: ["processing", "cancelled"],
      processing: ["packed", "cancelled"],
      packed: ["shipped", "cancelled"],
      shipped: ["out_for_delivery", "cancelled"],
      out_for_delivery: ["delivered", "cancelled"],
      delivered: ["returned"],
      returned: ["refunded"],
      cancelled: [],
      refunded: [],
    };

    const oldStatus = this.statusHistory[this.statusHistory.length - 1]?.status;
    const newStatus = this.status;

    if (oldStatus && !validTransitions[oldStatus].includes(newStatus)) {
      next(
        new Error(`Invalid status transition from ${oldStatus} to ${newStatus}`)
      );
    }
  }
  next();
});

// Add indexes for faster queries
orderSchema.index({ user: 1, createdAt: -1 });
orderSchema.index({ status: 1 });
orderSchema.index({ paymentStatus: 1 });
orderSchema.index({ "items.product": 1 });

export default mongoose.model<IOrder>("Order", orderSchema);
