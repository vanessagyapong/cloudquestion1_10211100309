"use client";

import React, { use, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  FiShoppingCart,
  FiHeart,
  FiChevronLeft,
  FiChevronRight,
  FiPackage,
  FiTrendingUp,
  FiArrowLeft,
} from "react-icons/fi";
import { useCart } from "@/contexts/CartContext";
import { useWishlist } from "@/contexts/WishlistContext";
import { Product } from "@/types/product";
import { productsApi } from "@/services/api";
import { toast } from "sonner";

const fadeIn = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
};

interface ProductDetailsPageProps {
  params: Promise<{ id: string }>;
}

export default function ProductDetailsPage({
  params,
}: ProductDetailsPageProps) {
  const { id } = use(params);
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const router = useRouter();
  const { addToCart } = useCart();
  const { toggleWishlist, items: wishlistItems } = useWishlist();

  React.useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await productsApi.getProduct(id);
        setProduct(response.data.data);
      } catch (error) {
        console.error("Error fetching product:", error);
        toast.error("Failed to load product details");
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  const handleAddToCart = async () => {
    if (!product) return;
    try {
      await addToCart(product._id, quantity);
      toast.success("Added to cart");
    } catch (error) {
      console.error("Error adding to cart:", error);
      toast.error("Failed to add to cart");
    }
  };

  const handleAddToWishlist = async () => {
    if (!product) return;
    try {
      await toggleWishlist(product._id);
      toast.success(
        wishlistItems.some((item) => item._id === product._id)
          ? "Removed from wishlist"
          : "Added to wishlist"
      );
    } catch (error) {
      console.error("Error updating wishlist:", error);
      toast.error("Failed to update wishlist");
    }
  };

  const nextImage = () => {
    if (!product) return;
    setCurrentImageIndex((prev) => (prev + 1) % product.images.length);
  };

  const previousImage = () => {
    if (!product) return;
    setCurrentImageIndex(
      (prev) => (prev - 1 + product.images.length) % product.images.length
    );
  };

  if (loading || !product) {
    return (
      <div className='min-h-screen flex items-center justify-center'>
        <div className='h-8 w-8 border-4 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin' />
      </div>
    );
  }

  return (
    <div className='main-layout'>
      <div className='content-container'>
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className='flex items-center gap-2 text-[var(--color-text-secondary)] hover:text-[var(--color-primary)] transition-colors duration-200 mb-6'
        >
          <FiArrowLeft className='h-5 w-5' />
          Back to Store
        </button>

        <motion.div
          className='grid grid-cols-1 lg:grid-cols-2 gap-8'
          initial={fadeIn.initial}
          animate={fadeIn.animate}
          exit={fadeIn.exit}
        >
          {/* Image Slider */}
          <div className='relative aspect-square bg-[var(--color-background-secondary)] rounded-lg overflow-hidden'>
            <AnimatePresence mode='wait'>
              <motion.div
                key={currentImageIndex}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className='relative w-full h-full'
              >
                <Image
                  src={product.images[currentImageIndex]}
                  alt={product.name}
                  fill
                  className='object-contain p-4'
                  sizes='(max-width: 1024px) 100vw, 50vw'
                  priority
                />
              </motion.div>
            </AnimatePresence>

            {product.images.length > 1 && (
              <>
                <button
                  onClick={previousImage}
                  className='absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/80 hover:bg-white shadow-lg transition-all duration-200'
                >
                  <FiChevronLeft className='h-6 w-6' />
                </button>
                <button
                  onClick={nextImage}
                  className='absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/80 hover:bg-white shadow-lg transition-all duration-200'
                >
                  <FiChevronRight className='h-6 w-6' />
                </button>
              </>
            )}

            {/* Thumbnail Navigation */}
            {product.images.length > 1 && (
              <div className='absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2'>
                {product.images.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`w-2 h-2 rounded-full transition-all duration-200 ${
                      currentImageIndex === index
                        ? "bg-[var(--color-primary)] w-4"
                        : "bg-neutral-300 hover:bg-neutral-400"
                    }`}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Product Information */}
          <div className='flex flex-col'>
            <div className='mb-6'>
              <div className='flex items-start justify-between gap-4'>
                <h1 className='text-3xl font-bold text-[var(--color-text-primary)]'>
                  {product.name}
                </h1>
                <motion.button
                  onClick={handleAddToWishlist}
                  className={`p-2 rounded-lg ${
                    wishlistItems.some((item) => item._id === product._id)
                      ? "bg-red-500 text-white"
                      : "bg-[var(--color-background-secondary)] text-[var(--color-text-secondary)] hover:text-red-500"
                  } transition-colors duration-200`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <FiHeart
                    className={`h-6 w-6 ${
                      wishlistItems.some((item) => item._id === product._id)
                        ? "fill-current"
                        : ""
                    }`}
                  />
                </motion.button>
              </div>

              <Link
                href={`/store/${product.store._id}`}
                className='text-[var(--color-text-secondary)] hover:text-[var(--color-primary)] transition-colors duration-200 mt-2 inline-block'
              >
                {product.store.name}
              </Link>
            </div>

            <div className='flex items-center gap-4 mb-6'>
              <span className='text-3xl font-bold text-[var(--color-primary)]'>
                $
                {product.price.toLocaleString("en-US", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </span>
              <div className='flex items-center gap-4 text-[var(--color-text-secondary)]'>
                <span className='flex items-center gap-1'>
                  <FiPackage className='h-5 w-5' />
                  {product.stock > 0
                    ? `${product.stock} in stock`
                    : "Out of stock"}
                </span>
                <span className='flex items-center gap-1'>
                  <FiTrendingUp className='h-5 w-5' />
                  {product.totalSales || 0} sold
                </span>
              </div>
            </div>

            <p className='text-[var(--color-text-secondary)] mb-8'>
              {product.description}
            </p>

            <div className='mt-auto'>
              <div className='flex items-center gap-4 mb-4'>
                <span className='text-[var(--color-text-secondary)]'>
                  Quantity:
                </span>
                <div className='flex items-center'>
                  <button
                    onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
                    className='p-2 rounded-l-lg bg-[var(--color-background-secondary)] text-[var(--color-text-secondary)] hover:text-[var(--color-primary)] transition-colors duration-200'
                    disabled={quantity <= 1}
                  >
                    -
                  </button>
                  <span className='px-4 py-2 bg-[var(--color-background-secondary)] text-[var(--color-text-primary)]'>
                    {quantity}
                  </span>
                  <button
                    onClick={() =>
                      setQuantity((prev) => Math.min(product.stock, prev + 1))
                    }
                    className='p-2 rounded-r-lg bg-[var(--color-background-secondary)] text-[var(--color-text-secondary)] hover:text-[var(--color-primary)] transition-colors duration-200'
                    disabled={quantity >= product.stock}
                  >
                    +
                  </button>
                </div>
              </div>

              <motion.button
                onClick={handleAddToCart}
                className='w-full py-3 px-6 rounded-lg bg-[var(--color-primary)] text-white font-medium hover:opacity-90 transition-opacity duration-200 flex items-center justify-center gap-2'
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                disabled={product.stock === 0}
              >
                <FiShoppingCart className='h-5 w-5' />
                {product.stock === 0 ? "Out of Stock" : "Add to Cart"}
              </motion.button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
