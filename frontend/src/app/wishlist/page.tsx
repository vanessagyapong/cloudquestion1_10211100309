"use client";

import React from "react";
import { useWishlist } from "@/contexts/WishlistContext";
import { useCart } from "@/contexts/CartContext";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import ProductCard from "@/components/ProductCard";
import { Product } from "@/types/product";

export default function WishlistPage() {
  const { wishlist, toggleWishlist } = useWishlist();
  const { addToCart } = useCart();
  const router = useRouter();

  const handleAddToCart = async (productId: string) => {
    try {
      await addToCart(productId, 1);
      toast.success("Added to cart");
    } catch (error) {
      console.error("Error adding to cart:", error);
      toast.error("Failed to add to cart");
    }
  };
  console.log(wishlist);

  return (
    <div className='min-h-screen bg-[var(--color-background-secondary)] py-8 pt-24'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
        <h1 className='text-2xl font-bold text-[var(--color-text-primary)] mb-8'>
          My Wishlist
        </h1>

        {wishlist.length === 0 ? (
          <div className='text-center py-12'>
            <p className='text-[var(--color-text-secondary)]'>
              Your wishlist is empty.
            </p>
          </div>
        ) : (
          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'>
            {wishlist.map((product) => (
              <ProductCard
                key={product?._id}
                product={product as unknown as Product}
                onAddToCart={() => handleAddToCart(product?._id)}
                onToggleWishlist={() => toggleWishlist(product?._id)}
                isInWishlist={true}
                onClick={() => router.push(`/productDetails/${product?._id}`)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
