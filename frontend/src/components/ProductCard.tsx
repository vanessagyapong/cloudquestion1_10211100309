"use client";

import React from "react";
import { motion } from "framer-motion";
import { Product } from "../types/product";
import { useCart } from "../contexts/CartContext";
import WishlistButton from "./WishlistButton";
import Image from "next/image";

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToCart } = useCart();

  const handleAddToCart = () => {
    addToCart(product._id, 1);
  };

  return (
    <motion.div
      className='bg-neutral-800 rounded-lg overflow-hidden shadow-lg border border-neutral-700 hover:border-indigo-500 transition-all duration-300'
      whileHover={{ scale: 1.02 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        type: "spring",
        stiffness: 300,
        damping: 24,
      }}
    >
      <div className='relative aspect-w-16 aspect-h-9 '>
        {product.images[0] && (
          <Image
            src={product.images[0]}
            alt={product.name}
            fill
            className='object-scale-down'
          />
        )}
        <div className='absolute top-2 right-2'>
          <WishlistButton productId={product._id} />
        </div>
      </div>

      <div className='p-4'>
        <h3 className='text-lg font-semibold text-white mb-2 line-clamp-2'>
          {product.name}
        </h3>
        <p className='text-gray-400 text-sm mb-4 line-clamp-3'>
          {product.description}
        </p>
        <div className='flex items-center justify-between'>
          <span className='text-2xl font-bold text-indigo-400'>
            ${product.price.toFixed(2)}
          </span>
          <motion.button
            onClick={handleAddToCart}
            className='px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors duration-200 disabled:bg-gray-600 disabled:cursor-not-allowed'
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            disabled={product.stock === 0}
          >
            {product.stock > 0 ? "Add to Cart" : "Out of Stock"}
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};

export default ProductCard;
