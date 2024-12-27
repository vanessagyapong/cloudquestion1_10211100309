import mongoose, { Document, Schema, Types } from "mongoose";
import { IStore } from "./store.model";

interface StoreDetails {
  _id: Types.ObjectId;
  name: string;
  logo?: string;
  rating: number;
  isActive: boolean;
  status: "pending" | "approved" | "rejected";
}

export interface IProduct extends Document {
  _id: Types.ObjectId;
  name: string;
  description: string;
  price: number;
  stock: number;
  store: Types.ObjectId | StoreDetails;
  images: string[];
  category: string;
  isActive: boolean;
  rating: number;
  totalRatings: number;
  totalSales: number;
  discount?: {
    percentage: number;
    startDate: Date;
    endDate: Date;
  };
  variants?: {
    name: string;
    options: string[];
  }[];
  specifications?: {
    name: string;
    value: string;
  }[];
  weight?: number;
  dimensions?: {
    length: number;
    width: number;
    height: number;
  };
  tags: string[];
  sku: string;
  barcode?: string;
  reviews: {
    user: Types.ObjectId;
    rating: number;
    comment: string;
    createdAt: Date;
  }[];
  createdAt: Date;
  updatedAt: Date;
}

const productSchema = new Schema<IProduct>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    stock: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    store: {
      type: Schema.Types.ObjectId,
      ref: "Store",
      required: true,
      index: true,
    },
    images: [
      {
        type: String,
        required: true,
      },
    ],
    category: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
      index: true,
    },
    totalRatings: {
      type: Number,
      default: 0,
    },
    totalSales: {
      type: Number,
      default: 0,
      index: true,
    },
    discount: {
      percentage: {
        type: Number,
        min: 0,
        max: 100,
      },
      startDate: Date,
      endDate: {
        type: Date,
        index: true,
      },
    },
    variants: [
      {
        name: String,
        options: [String],
      },
    ],
    specifications: [
      {
        name: String,
        value: String,
      },
    ],
    weight: {
      type: Number,
      min: 0,
    },
    dimensions: {
      length: Number,
      width: Number,
      height: Number,
    },
    tags: [String],
    sku: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    barcode: String,
    reviews: [
      {
        user: {
          type: Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        rating: {
          type: Number,
          required: true,
          min: 1,
          max: 5,
        },
        comment: String,
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Add text search index
productSchema.index({ name: "text", description: "text", tags: "text" });

// Pre-save hook to generate SKU if not provided
productSchema.pre("save", async function (next) {
  if (!this.sku) {
    const count = await mongoose.model("Product").countDocuments();
    this.sku = `SKU-${this.store}-${count + 1}`;
  }
  next();
});

export default mongoose.model<IProduct>("Product", productSchema);
