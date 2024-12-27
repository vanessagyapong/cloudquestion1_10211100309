import { Store } from "./store";

export interface ProductVariant {
  name: string;
  options: string[];
}

export interface ProductSpecification {
  name: string;
  value: string;
}

export interface ProductDimensions {
  length: number;
  width: number;
  height: number;
}

export interface ProductDiscount {
  percentage: number;
  startDate: string; // ISO date string
  endDate: string; // ISO date string
}

export interface ProductReview {
  user: string; // User ID
  rating: number;
  comment: string;
  createdAt: string; // ISO date string
}

export interface StoreDetails {
  _id: string;
  name: string;
  logo?: string;
  rating: number;
  isActive: boolean;
  status: "pending" | "approved" | "rejected";
}

export interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  images: string[];
  stock: number;
  totalSales: number;
  store: Store;
  createdAt: string;
  updatedAt: string;
  sales: number;
}

export interface ProductFormData {
  name: string;
  description: string;
  price: number;
  category: string;
  stock: number;
  images: string[];
}

export interface CreateProductData {
  name: string;
  description: string;
  price: number;
  category: string;
  stock: number;
  images: string[];
}

export interface UpdateProductData {
  name?: string;
  description?: string;
  price?: number;
  category?: string;
  stock?: number;
  images?: string[];
}

export interface ProductSearchParams {
  query?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  sortBy?: "price" | "rating" | "sales" | "newest";
  sortOrder?: "asc" | "desc";
  page?: number;
  limit?: number;
}
