import { Product } from "./product";
import { User } from "./user";

export interface OrderItem {
  product: Product;
  quantity: number;
  price: number; // Price at the time of purchase
  _id: string;
}

export interface ShippingAddress {
  street: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
}

export interface Order {
  _id: string;
  user: User;
  seller: User;
  items: OrderItem[];
  totalAmount: number;
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
  shippingAddress: ShippingAddress;
  paymentStatus: "pending" | "completed" | "failed" | "refunded";
  paymentMethod: string;
  createdAt: string;
  updatedAt: string;
  trackingNumber?: string;
  notes?: string;
}

export interface OrderSummary {
  _id: string;
  totalAmount: number;
  status: Order["status"];
  createdAt: string;
  items: Array<{
    productName: string;
    quantity: number;
    price: number;
  }>;
}
