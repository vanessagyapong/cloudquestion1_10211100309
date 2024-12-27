"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { wishlistApi } from "@/services/api";
import { toast } from "sonner";
import { WishlistItem } from "@/types/wishlist";

interface WishlistContextType {
  wishlist: WishlistItem[];
  toggleWishlist: (productId: string) => Promise<void>;
  isInWishlist: (productId: string) => boolean;
}

const WishlistContext = createContext<WishlistContextType | undefined>(
  undefined
);

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);

  const fetchWishlist = async () => {
    try {
      const response = await wishlistApi.getWishlist();
      setWishlist(response.data.data);
    } catch (error) {
      console.error("Error fetching wishlist:", error);
      toast.error("Failed to fetch wishlist");
    }
  };

  useEffect(() => {
    fetchWishlist();
  }, []);

  const toggleWishlist = async (productId: string) => {
    try {
      if (isInWishlist(productId)) {
        await wishlistApi.removeFromWishlist(productId);
        setWishlist((current) =>
          current.filter((item) => item.product._id !== productId)
        );
        toast.success("Removed from wishlist");
      } else {
        const response = await wishlistApi.addToWishlist(productId);
        setWishlist((current) => [...current, response.data.data]);
        toast.success("Added to wishlist");
      }
    } catch (error) {
      console.error("Error toggling wishlist:", error);
      toast.error("Failed to update wishlist");
    }
  };

  const isInWishlist = (productId: string) => {
    return wishlist.some((item) => item.product._id === productId);
  };

  return (
    <WishlistContext.Provider
      value={{ wishlist, toggleWishlist, isInWishlist }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (context === undefined) {
    throw new Error("useWishlist must be used within a WishlistProvider");
  }
  return context;
}
