import React from "react";
import Image from "next/image";
import { Product } from "@/types/product";
import { FaHeart, FaRegHeart } from "react-icons/fa";

export interface ProductCardProps {
  product: Product;
  onAddToCart: () => void;
  onToggleWishlist: () => void;
  isInWishlist: boolean;
  onClick: () => void;
}

export default function ProductCard({
  product,
  onAddToCart,
  onToggleWishlist,
  isInWishlist,
  onClick,
}: ProductCardProps) {
  return (
    <div
      className='group relative bg-white rounded-lg shadow-sm overflow-hidden border border-[var(--color-border)] hover:border-[var(--color-primary)] transition-all duration-300 cursor-pointer'
      onClick={onClick}
    >
      {/* Wishlist Button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onToggleWishlist();
        }}
        className='absolute top-4 right-4 z-10 p-2 rounded-full bg-white/80 hover:bg-white shadow-lg transition-all duration-200'
      >
        {isInWishlist ? (
          <FaHeart className='h-5 w-5 text-red-500' />
        ) : (
          <FaRegHeart className='h-5 w-5 text-[var(--color-text-secondary)] hover:text-red-500' />
        )}
      </button>

      {/* Image */}
      <div className='relative aspect-square bg-[var(--color-background-secondary)] group-hover:bg-[var(--color-background-hover)] transition-colors duration-300'>
        <Image
          src={product?.images[0] || "/placeholder.png"}
          alt={product?.name || ""}
          fill
          className='object-contain p-4 transition-transform duration-300 group-hover:scale-105'
          sizes='(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw'
        />
      </div>

      {/* Content */}
      <div className='p-4'>
        <h3 className='text-lg font-semibold text-[var(--color-text-primary)] line-clamp-2 leading-tight group-hover:text-[var(--color-primary)] transition-colors duration-200'>
          {product?.name || ""}
        </h3>
        <p className='text-sm text-[var(--color-text-secondary)] mt-1'>
          {product?.store?.name || ""}
        </p>
        <div className='flex items-center justify-between mt-2'>
          <span className='text-lg font-bold text-[var(--color-primary)]'>
            ${product?.price?.toFixed(2) || ""}
          </span>
          <span className='text-sm text-[var(--color-text-secondary)]'>
            {product?.sales || 0} sold
          </span>
        </div>
        <p className='text-sm text-[var(--color-text-secondary)] mt-2 line-clamp-2 min-h-[2.5rem]'>
          {product?.description || ""}
        </p>
        <div className='mt-4'>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onAddToCart();
            }}
            disabled={product?.stock === 0}
            className='w-full py-2 px-4 rounded-lg bg-[var(--color-primary)] text-white font-medium hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity duration-200'
          >
            {product?.stock === 0 ? "Out of Stock" : "Add to Cart"}
          </button>
        </div>
      </div>
    </div>
  );
}
