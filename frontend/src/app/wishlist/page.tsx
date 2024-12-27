"use client";

import React from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { FiShoppingCart, FiTrash2, FiLoader } from "react-icons/fi";
import { useWishlist } from "@/contexts/WishlistContext";
import { useCart } from "@/contexts/CartContext";
import { toast } from "sonner";
import { Product } from "@/types/product";

const fadeIn = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
};

export default function WishlistPage() {
  const { items: wishlistItems, toggleWishlist } = useWishlist();
  const { addToCart } = useCart();

  const handleAddToCart = async (productId: string) => {
    try {
      await addToCart(productId, 1);
      toast.success("Added to cart");
    } catch (error) {
      console.error("Error adding to cart:", error);
      toast.error("Failed to add to cart");
    }
  };

  const handleRemoveFromWishlist = async (productId: string) => {
    try {
      await toggleWishlist(productId);
      toast.success("Removed from wishlist");
    } catch (error) {
      console.error("Error removing from wishlist:", error);
      toast.error("Failed to remove from wishlist");
    }
  };

  if (!wishlistItems) {
    return (
      <div className='min-h-screen flex items-center justify-center'>
        <FiLoader className='h-8 w-8 animate-spin text-[var(--color-primary)]' />
      </div>
    );
  }

  return (
    <div className='main-layout'>
      <div className='content-container'>
        <div className='flex items-center justify-between mb-8'>
          <div>
            <h1 className='text-3xl font-bold text-[var(--color-text-primary)]'>
              My Wishlist
            </h1>
            <p className='mt-2 text-[var(--color-text-secondary)]'>
              {wishlistItems.length} items saved
            </p>
          </div>
        </div>

        {wishlistItems.length > 0 ? (
          <div className='grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'>
            {(wishlistItems as Product[]).map((product) => (
              <motion.div
                key={product._id}
                className='card overflow-hidden'
                initial={fadeIn.initial}
                animate={fadeIn.animate}
                whileHover={{ scale: 1.02 }}
              >
                <div className='relative aspect-square'>
                  <Image
                    src={product.images[0]}
                    alt={product.name}
                    fill
                    className='object-scale-down'
                  />
                </div>
                <div className='p-4'>
                  <h3 className='text-lg font-medium text-[var(--color-text-primary)] mb-2'>
                    {product.name}
                  </h3>
                  <p className='text-[var(--color-text-secondary)] text-sm mb-4 line-clamp-2'>
                    {product.description}
                  </p>
                  <div className='flex items-center justify-between'>
                    <span className='text-lg font-bold text-[var(--color-text-primary)]'>
                      ${product.price.toFixed(2)}
                    </span>
                    <div className='flex space-x-2'>
                      <button
                        onClick={() => handleRemoveFromWishlist(product._id)}
                        className='btn-outline-danger p-2'
                      >
                        <FiTrash2 className='h-4 w-4' />
                      </button>
                      <button
                        onClick={() => handleAddToCart(product._id)}
                        className='btn-primary p-2'
                      >
                        <FiShoppingCart className='h-4 w-4' />
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className='text-center py-12'>
            <div className='max-w-md mx-auto'>
              <h2 className='text-xl font-semibold text-[var(--color-text-primary)] mb-2'>
                Your wishlist is empty
              </h2>
              <p className='text-[var(--color-text-secondary)] mb-6'>
                Save items you like by clicking the heart icon on products
              </p>
              <motion.a
                href='/store'
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className='btn-primary inline-flex items-center'
              >
                <FiShoppingCart className='mr-2 h-5 w-5' />
                Start Shopping
              </motion.a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
