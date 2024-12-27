"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { wishlistApi } from "@/services/api";
import { Product } from "@/types/product";
import { useAuth } from "./AuthContext";

interface WishlistContextType {
  items: Product[];
  toggleWishlist: (productId: string) => Promise<void>;
}

const WishlistContext = createContext<WishlistContextType>({
  items: [],
  toggleWishlist: async () => {},
});

export const useWishlist = () => useContext(WishlistContext);

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<Product[]>([]);
  const { user } = useAuth();

  useEffect(() => {
    const fetchWishlist = async () => {
      if (!user) {
        return;
      } else {
        try {
          const response = await wishlistApi.getWishlist();
          setItems(response.data.data as unknown as Product[]);
        } catch (error) {
          console.error("Error fetching wishlist:", error);
        }
      }
    };

    fetchWishlist();
  }, [user]);

  const toggleWishlist = async (productId: string) => {
    try {
      if (items.some((item) => item._id === productId)) {
        await wishlistApi.removeFromWishlist(productId);
        setItems(items.filter((item) => item._id !== productId));
      } else {
        await wishlistApi.addToWishlist(productId);
        const response = await wishlistApi.getWishlist();
        setItems(response.data.data as unknown as Product[]);
      }
    } catch (error) {
      console.error("Error toggling wishlist:", error);
      throw error;
    }
  };

  return (
    <WishlistContext.Provider value={{ items, toggleWishlist }}>
      {children}
    </WishlistContext.Provider>
  );
}
