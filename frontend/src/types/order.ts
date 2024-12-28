export type OrderStatus =
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
export type PaymentStatus =
  | "pending"
  | "processing"
  | "completed"
  | "failed"
  | "refunded";

export interface OrderItem {
  product: string;
  quantity: number;
  price: number;
  _id?: string;
}

export interface ShippingAddress {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export interface PaymentMethod {
  type: "card";
  details: {
    name: string;
    number: string;
    expiry: string;
    cvv: string;
  };
}

export interface StatusHistoryItem {
  status: OrderStatus;
  timestamp: string;
  _id?: string;
}

export interface Order {
  _id: string;
  user: string;
  items: OrderItem[];
  totalAmount: number;
  shippingAddress: ShippingAddress;
  status: OrderStatus;
  statusHistory: StatusHistoryItem[];
  paymentStatus: PaymentStatus;
  paymentMethod: PaymentMethod;
  estimatedDeliveryDate: string;
  trackingNumber?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateOrderData {
  items: OrderItem[];
  totalAmount: number;
  shippingAddress: ShippingAddress;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod: PaymentMethod;
  estimatedDeliveryDate: string;
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
