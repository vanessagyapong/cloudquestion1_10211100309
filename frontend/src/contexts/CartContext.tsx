"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { useAuth } from "./AuthContext";
import { cartApi } from "@/services/api";
import { setCart } from "../lib/db";
import { toast } from "sonner";
import { CartItem as CartItemType } from "@/types/cart";
import { AxiosResponse } from "axios";

interface CartItem extends CartItemType {
  price: number;
}

interface ApiResponse<T> {
  data: T;
  message?: string;
}

interface CartContextType {
  items: CartItem[];
  addToCart: (productId: string, quantity: number) => Promise<void>;
  updateQuantity: (productId: string, quantity: number) => Promise<void>;
  removeFromCart: (productId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  refreshCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const { user } = useAuth();

  const transformCartItems = (cartItems: CartItemType[]): CartItem[] => {
    return cartItems.map((item) => ({
      ...item,
      price: item.product.price,
    }));
  };

  const refreshCart = useCallback(async () => {
    if (!user) return;

    try {
      const response: AxiosResponse<ApiResponse<CartItemType[]>> =
        await cartApi.getCart();
      const cartItems = response?.data?.data || [];
      setItems(transformCartItems(cartItems));
    } catch (error) {
      console.error("Error loading cart:", error);
      setItems([]);
    }
  }, [user]);

  useEffect(() => {
    refreshCart();
  }, [refreshCart]);

  const addToCart = async (productId: string, quantity: number) => {
    try {
      if (!user) {
        toast.error("Please log in to add items to cart");
        return;
      }

      await cartApi.addToCart(productId, quantity);
      await refreshCart(); // Refresh the entire cart to ensure consistency
    } catch (error) {
      console.error("Error adding to cart:", error);
      toast.error("Failed to add to cart");
    }
  };

  const updateQuantity = async (productId: string, quantity: number) => {
    try {
      if (!user) {
        toast.error("Please log in to update cart");
        return;
      }

      await cartApi.updateCartItem(productId, quantity);
      await refreshCart(); // Refresh the entire cart to ensure consistency
      toast.success("Cart updated successfully!");
    } catch (error) {
      console.error("Error updating cart:", error);
      toast.error("Failed to update cart");
    }
  };

  const removeFromCart = async (productId: string) => {
    try {
      if (!user) {
        toast.error("Please log in to remove items from cart");
        return;
      }

      await cartApi.removeFromCart(productId);
      await refreshCart(); // Refresh the entire cart to ensure consistency
      toast.success("Removed from cart successfully!");
    } catch (error) {
      console.error("Error removing from cart:", error);
      toast.error("Failed to remove from cart");
    }
  };

  const clearCart = async () => {
    try {
      if (!user) {
        toast.error("Please log in to clear cart");
        return;
      }

      await cartApi.clearCart();
      setItems([]);
      await setCart([]);
      toast.success("Cart cleared successfully!");
    } catch (error) {
      console.error("Error clearing cart:", error);
      toast.error("Failed to clear cart");
    }
  };

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        refreshCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
