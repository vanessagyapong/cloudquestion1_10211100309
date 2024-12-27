"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { productsApi } from "@/services/api";
import { Product } from "@/types/product";
import {
  FiShoppingCart,
  FiHeart,
  FiLoader,
  FiPackage,
  FiTrendingUp,
} from "react-icons/fi";
import { useCart } from "@/contexts/CartContext";
import { useWishlist } from "@/contexts/WishlistContext";
import { toast } from "sonner";
import { AxiosError } from "axios";
import ProtectedRoute from "@/components/ProtectedRoute";
import Link from "next/link";
import { useRouter } from "next/navigation";

const fadeIn = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
};

const categories = [
  "All",
  "Electronics",
  "Clothing",
  "Books",
  "Home & Garden",
  "Sports",
] as const;

type Category = (typeof categories)[number];

export default function StorePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<Category>("All");
  const { addToCart } = useCart();
  const { toggleWishlist, items: wishlistItems } = useWishlist();
  const router = useRouter();

  useEffect(() => {
    let isMounted = true;

    const fetchProducts = async () => {
      try {
        const response = await productsApi.getProducts();
        if (isMounted) {
          setProducts(response.data.data);
        }
      } catch (error) {
        if (!(error instanceof AxiosError && error.message === "canceled")) {
          console.error("Error fetching products:", error);
          toast.error("Failed to load products");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchProducts();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleAddToCart = async (product: Product) => {
    try {
      await addToCart(product._id, 1);
      toast.success("Added to cart");
    } catch (error) {
      console.error("Error adding to cart:", error);
      toast.error("Failed to add to cart");
    }
  };

  const handleAddToWishlist = async (product: Product) => {
    try {
      await toggleWishlist(product._id);
      toast.success("Added to wishlist");
    } catch (error) {
      console.error("Error adding to wishlist:", error);
      toast.error("Failed to add to wishlist");
    }
  };

  const filteredProducts =
    selectedCategory === "All"
      ? products
      : products.filter((product) => product.category === selectedCategory);

  if (loading) {
    return (
      <div className='min-h-screen flex items-center justify-center'>
        <FiLoader className='h-8 w-8 animate-spin text-[var(--color-primary)]' />
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <div className='main-layout'>
        <div className='content-container'>
          <div className='flex flex-col md:flex-row md:items-center justify-between mb-8'>
            <div>
              <h1 className='text-3xl font-bold text-[var(--color-text-primary)]'>
                Store
              </h1>
              <p className='mt-2 text-[var(--color-text-secondary)]'>
                {filteredProducts.length} products available
              </p>
            </div>
            <div className='mt-4 md:mt-0 flex items-center gap-2 overflow-x-auto no-scrollbar'>
              {categories.map((category) => (
                <motion.button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                    selectedCategory === category
                      ? "text-white bg-[var(--color-primary)]"
                      : "text-[var(--color-text-secondary)] bg-[var(--color-background-secondary)] hover:text-white hover:bg-[var(--color-primary)]"
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {category}
                </motion.button>
              ))}
            </div>
          </div>

          {filteredProducts.length > 0 ? (
            <div className='grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'>
              {filteredProducts.map((product) => (
                <motion.div
                  key={product._id}
                  className='group relative bg-[var(--color-background-secondary)] rounded-lg shadow-lg overflow-hidden border border-[var(--color-border)] hover:border-[var(--color-primary)] transition-all duration-300'
                  initial={fadeIn.initial}
                  animate={fadeIn.animate}
                  whileHover={{ y: -5, transition: { duration: 0.2 } }}
                >
                  {/* Wishlist Button (Top Right) */}
                  <motion.button
                    onClick={() => handleAddToWishlist(product)}
                    className={`absolute top-4 right-4 z-10 p-2.5 rounded-full shadow-lg backdrop-blur-md ${
                      wishlistItems.some((item) => item._id === product._id)
                        ? "bg-red-500/90 text-white"
                        : "bg-white/90 hover:bg-red-500/90 hover:text-white"
                    } transition-colors duration-200`}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    disabled={wishlistItems.some(
                      (item) => item._id === product._id
                    )}
                  >
                    <FiHeart
                      className={`h-5 w-5 ${
                        wishlistItems.some((item) => item._id === product._id)
                          ? "fill-current"
                          : ""
                      }`}
                    />
                  </motion.button>

                  {/* Product Details Section */}
                  <div>
                    {/* Image Container */}
                    <Link
                      href={`/productDetails/${product._id}`}
                      className='block'
                    >
                      <div className='relative aspect-square bg-[var(--color-background-tertiary)] group-hover:bg-[var(--color-background-hover)] transition-colors duration-300'>
                        <Image
                          src={product.images[0]}
                          alt={product.name}
                          fill
                          className='object-contain p-4 transition-transform duration-300 group-hover:scale-105'
                          sizes='(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw'
                        />
                      </div>
                    </Link>

                    {/* Content Container */}
                    <div className='p-4'>
                      <div className='mb-1'>
                        <Link
                          href={`/productDetails/${product._id}`}
                          className='block'
                        >
                          <h3 className='text-lg font-semibold text-[var(--color-text-primary)] line-clamp-2 leading-tight hover:text-[var(--color-primary)] transition-colors duration-200'>
                            {product.name}
                          </h3>
                        </Link>
                        <button
                          onClick={() =>
                            router.push(`/store/${product.store._id}`)
                          }
                          className='text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-primary)] transition-colors duration-200 mt-1'
                        >
                          {product.store.name}
                        </button>
                      </div>

                      <div className='flex items-center justify-between mt-2 mb-3'>
                        <span className='text-lg font-bold text-[var(--color-primary)]'>
                          $
                          {product.price.toLocaleString("en-US", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </span>
                        <div className='flex items-center gap-2 text-sm text-[var(--color-text-secondary)]'>
                          <span className='flex items-center gap-1'>
                            <FiTrendingUp className='h-4 w-4' />
                            {product.totalSales || 0}
                          </span>
                        </div>
                      </div>

                      <p className='text-[var(--color-text-secondary)] text-sm mb-3 line-clamp-2 min-h-[2.5rem]'>
                        {product.description}
                      </p>

                      <div className='flex items-center justify-between text-sm text-[var(--color-text-secondary)]'>
                        <span className='flex items-center gap-1'>
                          <FiPackage className='h-4 w-4' />
                          {product.stock > 0
                            ? `${product.stock} in stock`
                            : "Out of stock"}
                        </span>
                      </div>
                    </div>

                    {/* Add to Cart Button (Full Width) */}
                    <div className='p-4 pt-0'>
                      <motion.button
                        onClick={() => handleAddToCart(product)}
                        className='w-full py-2 px-4 rounded-lg bg-[var(--color-primary)] text-white font-medium hover:opacity-90 transition-opacity duration-200 flex items-center justify-center gap-2'
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        disabled={product.stock === 0}
                      >
                        <FiShoppingCart className='h-4 w-4' />
                        {product.stock === 0 ? "Out of Stock" : "Add to Cart"}
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className='text-center py-12'>
              <p className='text-[var(--color-text-secondary)]'>
                No products available in this category.
              </p>
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
