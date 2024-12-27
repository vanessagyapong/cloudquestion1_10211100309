import axios from "axios";
import Cookies from "js-cookie";
import {
  LoginData,
  RegisterData,
  TokenResponse,
  AuthResponse,
} from "@/types/auth";
import { User } from "@/types/user";
import { Store, CreateStoreData } from "@/types/store";
import { Product, CreateProductData, UpdateProductData } from "@/types/product";
import { WishlistItem } from "@/types/wishlist";
import { CartItem } from "@/types/cart";
import { Order } from "@/types/order";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "https://green-flashy-form.glitch.me/api";

const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

axiosInstance.interceptors.request.use((config) => {
  const token = Cookies.get("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth API
export const authApi = {
  register: (data: RegisterData) =>
    axiosInstance.post<AuthResponse>("/auth/register", data),
  login: (data: LoginData) =>
    axiosInstance.post<AuthResponse>("/auth/login", data),
  logout: () => axiosInstance.post("/auth/logout"),
  refreshToken: (refreshToken: string) =>
    axiosInstance.post<TokenResponse>("/auth/refresh-token", { refreshToken }),
};

// User API
export const userApi = {
  getProfile: () => axiosInstance.get<{ data: User }>("/users/profile"),
  updateProfile: (data: Partial<User>) =>
    axiosInstance.put<{ data: User }>("/users/profile", data),
  changePassword: (currentPassword: string, newPassword: string) =>
    axiosInstance.put<{ message: string }>("/users/change-password", {
      currentPassword,
      newPassword,
    }),
  becomeSeller: (data: CreateStoreData) =>
    axiosInstance.post<{ data: { store: Store }; message: string }>(
      "/users/become-seller",
      data
    ),
  deleteProfile: () =>
    axiosInstance.delete<{ message: string }>("/users/profile"),
};

// Products API
export const productsApi = {
  getProducts: () => axiosInstance.get<{ data: Product[] }>("/products"),
  getProduct: (id: string) =>
    axiosInstance.get<{ data: Product }>(`/products/${id}`),
  searchProducts: (query: string, category?: string) =>
    axiosInstance.get<{ data: Product[] }>("/products/search", {
      params: { query, category },
    }),
  getSellerProducts: () =>
    axiosInstance.get<{ data: Product[] }>("/products/seller"),
  createProduct: (data: CreateProductData) =>
    axiosInstance.post<{ data: Product }>("/products", data),
  updateProduct: (id: string, data: UpdateProductData) =>
    axiosInstance.put<{ data: Product }>(`/products/${id}`, data),
  deleteProduct: (id: string) =>
    axiosInstance.delete<{ message: string }>(`/products/${id}`),
  submitReview: (productId: string, rating: number, comment: string) =>
    axiosInstance.post(`/products/${productId}/reviews`, { rating, comment }),
};

// Wishlist API
export const wishlistApi = {
  getWishlist: () => axiosInstance.get<{ data: WishlistItem[] }>("/wishlist"),
  addToWishlist: (productId: string) =>
    axiosInstance.post<{ data: WishlistItem }>(`/wishlist/${productId}`),
  removeFromWishlist: (productId: string) =>
    axiosInstance.delete<{ message: string }>(`/wishlist/${productId}`),
};

// Cart API
export const cartApi = {
  getCart: () => axiosInstance.get<{ data: CartItem[] }>("/cart"),
  addToCart: (productId: string, quantity: number) =>
    axiosInstance.post<{ data: CartItem }>("/cart", { productId, quantity }),
  updateCartItem: (productId: string, quantity: number) =>
    axiosInstance.put<{ data: CartItem }>(`/cart/${productId}`, { quantity }),
  removeFromCart: (productId: string) =>
    axiosInstance.delete<{ data: CartItem[] }>(`/cart/${productId}`),
  clearCart: () => axiosInstance.delete<{ message: string }>("/cart"),
};

// Store API
export const storeApi = {
  getStore: (id: string) => axiosInstance.get<{ data: Store }>(`/stores/${id}`),
  getMyStore: () => axiosInstance.get<{ data: Store }>("/store/my-store"),
  updateStore: (data: FormData) =>
    axiosInstance.put<{ data: { store: Store } }>("/stores/me", data),
  getStoreProducts: () =>
    axiosInstance.get<{ data: Product[] }>("/stores/me/products"),
  createStore: (data: FormData) =>
    axiosInstance.post<{ data: { store: Store } }>("/stores", data),
  createProduct: (data: CreateProductData) =>
    axiosInstance.post<{ data: Product }>("/stores/me/products", data),
  updateProduct: (id: string, data: CreateProductData) =>
    axiosInstance.put<{ data: Product }>(`/stores/me/products/${id}`, data),
  deleteProduct: (id: string) =>
    axiosInstance.delete<{ message: string }>(`/stores/me/products/${id}`),
};

// Orders API
export const ordersApi = {
  createOrder: (data: {
    items: Array<{ productId: string; quantity: number }>;
    shippingAddress: {
      street: string;
      city: string;
      state: string;
      country: string;
      postalCode: string;
    };
    paymentMethod: string;
  }) => axiosInstance.post<{ data: Order }>("/orders", data),

  getOrders: () => axiosInstance.get<{ data: Order[] }>("/orders"),

  getOrder: (id: string) => axiosInstance.get<{ data: Order }>(`/orders/${id}`),

  getSellerOrders: () => axiosInstance.get<{ data: Order[] }>("/orders/seller"),

  updateOrderStatus: (orderId: string, status: Order["status"]) =>
    axiosInstance.put<{ data: Order }>(`/orders/${orderId}/status`, { status }),

  cancelOrder: (orderId: string) =>
    axiosInstance.put<{ data: Order }>(`/orders/${orderId}/cancel`),

  updateShippingInfo: (orderId: string, trackingNumber: string) =>
    axiosInstance.put<{ data: Order }>(`/orders/${orderId}/shipping`, {
      trackingNumber,
    }),
};

// Reviews API
export const reviewsApi = {
  createReview: (
    productId: string,
    data: {
      rating: number;
      comment: string;
    }
  ) =>
    axiosInstance.post<{ message: string }>(
      `/products/${productId}/reviews`,
      data
    ),

  getProductReviews: (productId: string) =>
    axiosInstance.get<{
      data: Array<{
        _id: string;
        user: User;
        rating: number;
        comment: string;
        createdAt: string;
      }>;
    }>(`/products/${productId}/reviews`),

  updateReview: (
    productId: string,
    reviewId: string,
    data: {
      rating?: number;
      comment?: string;
    }
  ) =>
    axiosInstance.put<{ message: string }>(
      `/products/${productId}/reviews/${reviewId}`,
      data
    ),

  deleteReview: (productId: string, reviewId: string) =>
    axiosInstance.delete<{ message: string }>(
      `/products/${productId}/reviews/${reviewId}`
    ),
};

// Categories API
export const categoriesApi = {
  getCategories: () => axiosInstance.get<{ data: string[] }>("/categories"),

  getCategoryProducts: (category: string) =>
    axiosInstance.get<{ data: Product[] }>(`/categories/${category}/products`),
};

// Stats API
export const statsApi = {
  getSellerStats: () =>
    axiosInstance.get<{
      data: {
        totalSales: number;
        totalOrders: number;
        totalProducts: number;
        recentOrders: Order[];
        topProducts: Array<{
          _id: string;
          name: string;
          totalSales: number;
          revenue: number;
        }>;
      };
    }>("/stats/seller"),

  getAdminStats: () =>
    axiosInstance.get<{
      data: {
        totalUsers: number;
        totalSellers: number;
        totalProducts: number;
        totalOrders: number;
        recentOrders: Order[];
        topSellers: Array<{
          _id: string;
          name: string;
          totalSales: number;
          revenue: number;
        }>;
      };
    }>("/stats/admin"),
};
