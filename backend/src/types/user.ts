import { Document, Types } from "mongoose";

// Use type-only imports to avoid circular dependencies
import type { IStore } from "./store";
import type { IProduct } from "./product";

interface CartItem {
  product: Types.ObjectId | IProduct;
  quantity: number;
}

interface Cart {
  items: CartItem[];
  totalItems: number;
  totalAmount: number;
}

export interface IUser extends Document {
  _id: Types.ObjectId;
  name: string;
  email: string;
  password: string;
  phone?: string;
  gender?: string;
  dateOfBirth?: Date;
  bio?: string;
  role: "user" | "admin" | "seller";
  isActive: boolean;
  store?: Types.ObjectId | IStore;
  wishlist: Types.ObjectId[] | IProduct[];
  cart: Cart;
  preferences?: {
    language: string;
    currency: string;
    notifications: {
      email: boolean;
      push: boolean;
      sms: boolean;
    };
  };
  createdAt: Date;
  updatedAt: Date;
}
