import mongoose, { Document, Schema, Types } from "mongoose";
import { IUser } from "./user.model";

export interface IStore extends Document {
  _id: Types.ObjectId;
  name: string;
  description: string;
  owner: Types.ObjectId | IUser;
  status: "pending" | "approved" | "rejected";
  isActive: boolean;
  rating: number;
  totalRatings: number;
  totalSales: number;
  balance: number;
  logo?: string;
  banner?: string;
  address?: string;
  contactEmail?: string;
  contactPhone?: string;
  socialLinks?: {
    website?: string;
    facebook?: string;
    twitter?: string;
    instagram?: string;
  };
  businessHours?: {
    monday?: string;
    tuesday?: string;
    wednesday?: string;
    thursday?: string;
    friday?: string;
    saturday?: string;
    sunday?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const storeSchema = new Schema<IStore>(
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
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    isActive: {
      type: Boolean,
      default: false,
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    totalRatings: {
      type: Number,
      default: 0,
    },
    totalSales: {
      type: Number,
      default: 0,
    },
    balance: {
      type: Number,
      default: 0,
    },
    logo: {
      type: String,
      trim: true,
    },
    banner: {
      type: String,
      trim: true,
    },
    address: {
      type: String,
      trim: true,
    },
    contactEmail: {
      type: String,
      trim: true,
      lowercase: true,
    },
    contactPhone: {
      type: String,
      trim: true,
    },
    socialLinks: {
      website: String,
      facebook: String,
      twitter: String,
      instagram: String,
    },
    businessHours: {
      monday: String,
      tuesday: String,
      wednesday: String,
      thursday: String,
      friday: String,
      saturday: String,
      sunday: String,
    },
  },
  {
    timestamps: true,
  }
);

// Add indexes for faster queries
storeSchema.index({ owner: 1 });
storeSchema.index({ status: 1 });
storeSchema.index({ name: "text", description: "text" });
storeSchema.index({ rating: -1 });
storeSchema.index({ totalSales: -1 });

export default mongoose.model<IStore>("Store", storeSchema);
