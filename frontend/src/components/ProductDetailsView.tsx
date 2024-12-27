"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/contexts/CartContext";
import { Product } from "@/types/product";

interface ProductDetailsViewProps {
  product: Product;
}

export default function ProductDetailsView({
  product,
}: ProductDetailsViewProps) {
  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);

  const handleAddToCart = () => {
    addToCart(product._id, quantity);
  };

  return (
    <div className='min-h-screen bg-gray-50 py-8'>
      <div className='max-w-6xl mx-auto px-4'>
        <Link
          href='/'
          className='text-blue-500 hover:text-blue-600 mb-4 inline-block'
        >
          ← Back to Products
        </Link>

        <div className='bg-white rounded-lg shadow-lg p-6 grid md:grid-cols-2 gap-8'>
          <div className='relative h-96'>
            {product.images[0] && (
              <Image
                src={product.images[0]}
                alt={product.name}
                fill
                className='object-contain'
              />
            )}
          </div>

          <div>
            <h1 className='text-3xl font-bold mb-4'>{product.name}</h1>
            <p className='text-gray-600 mb-4'>{product.description}</p>
            <div className='text-2xl font-bold mb-4'>
              ${product.price.toFixed(2)}
            </div>
            <div className='mb-4'>
              <span className='text-gray-600'>Stock: </span>
              <span className='font-semibold'>{product.stock} units</span>
            </div>
            <div className='mb-4'>
              <label className='block text-gray-600 mb-2'>Quantity:</label>
              <input
                type='number'
                min='1'
                max={product.stock}
                value={quantity}
                onChange={(e) =>
                  setQuantity(Math.min(Number(e.target.value), product.stock))
                }
                className='w-24 px-3 py-2 border rounded-lg'
              />
            </div>
            <button
              onClick={handleAddToCart}
              disabled={product.stock === 0}
              className='w-full bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed'
            >
              {product.stock > 0 ? "Add to Cart" : "Out of Stock"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
