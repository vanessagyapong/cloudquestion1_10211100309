import mongoose, { Schema, Model } from "mongoose";
import { IUser } from "../types/user";

const userSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
      select: false,
    },
    phone: {
      type: String,
      trim: true,
    },
    gender: {
      type: String,
      enum: {
        values: ["male", "female", "other", "MALE", "FEMALE", "OTHER"],
        message:
          "Gender must be either 'male', 'female', or 'other' (case insensitive)",
      },
      set: (value: string) => value.toLowerCase(),
    },
    dateOfBirth: {
      type: Date,
    },
    bio: {
      type: String,
      maxlength: 500,
    },
    role: {
      type: String,
      enum: ["user", "admin", "seller"],
      default: "user",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    store: {
      type: Schema.Types.ObjectId,
      ref: "Store",
    },
    wishlist: [
      {
        type: Schema.Types.ObjectId,
        ref: "Product",
      },
    ],
    cart: {
      items: [
        {
          product: {
            type: Schema.Types.ObjectId,
            ref: "Product",
            required: true,
          },
          quantity: {
            type: Number,
            required: true,
            min: 1,
            default: 1,
          },
        },
      ],
      totalItems: {
        type: Number,
        default: 0,
      },
      totalAmount: {
        type: Number,
        default: 0,
      },
    },
    preferences: {
      language: {
        type: String,
        default: "en",
      },
      currency: {
        type: String,
        default: "USD",
      },
      notifications: {
        email: {
          type: Boolean,
          default: true,
        },
        push: {
          type: Boolean,
          default: true,
        },
        sms: {
          type: Boolean,
          default: false,
        },
      },
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
userSchema.index({ role: 1 });
userSchema.index({ "cart.items.product": 1 });
userSchema.index({ wishlist: 1 });

const User: Model<IUser> = mongoose.model<IUser>("User", userSchema);

export default User;
