"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useCart } from "@/contexts/CartContext";
import { motion } from "framer-motion";
import { CartItem } from "@/types/cart";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export default function Cart() {
  const { items, removeFromCart, updateQuantity } = useCart();
  const [isLoading, setIsLoading] = useState(true);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  useEffect(() => {
    if (items) {
      setCartItems(items);
      setIsLoading(false);
    }
  }, [items]);

  const total = cartItems.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  const handleQuantityUpdate = async (
    productId: string,
    newQuantity: number
  ) => {
    try {
      await updateQuantity(productId, newQuantity);
      setCartItems(items); // Update local state with new items
    } catch (error) {
      console.error("Error updating quantity:", error);
    }
  };

  const handleRemoveItem = async (productId: string) => {
    try {
      await removeFromCart(productId);
      setCartItems(items.filter((item) => item._id !== productId));
    } catch (error) {
      console.error("Error removing item:", error);
    }
  };

  if (isLoading) {
    return (
      <div className='min-h-screen py-12 pt-24'>
        <div className='max-w-6xl mx-auto px-4'>
          <div className='text-center'>
            <h1 className='text-3xl font-bold mb-8 text-[var(--color-text-primary)]'>
              Loading Cart...
            </h1>
          </div>
        </div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className='min-h-screen py-12 pt-24'>
        <div className='max-w-6xl mx-auto px-4'>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className='text-center'
          >
            <h1 className='text-3xl font-bold mb-8 text-[var(--color-text-primary)]'>
              Your Cart
            </h1>
            <div className='bg-[var(--color-background-secondary)] rounded-lg shadow-lg p-12 border border-[var(--color-border)] max-w-2xl mx-auto'>
              <motion.div
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <svg
                  className='mx-auto h-16 w-16 text-[var(--color-text-secondary)]'
                  fill='none'
                  viewBox='0 0 24 24'
                  stroke='currentColor'
                  aria-hidden='true'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={1.5}
                    d='M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z'
                  />
                </svg>
              </motion.div>
              <p className='mt-6 text-[var(--color-text-secondary)] text-lg'>
                Your cart is empty
              </p>
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className='mt-8'
              >
                <Link
                  href='/store'
                  className='inline-flex text-white items-center px-6 py-3 border border-transparent rounded-lg shadow-sm text-base font-medium text-[var(--color-text-inverse)] bg-[var(--color-primary)] hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--color-primary)] transition-all duration-200'
                >
                  Continue Shopping
                </Link>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen py-12 pt-24'>
      <div className='max-w-6xl mx-auto px-4'>
        <motion.div
          variants={containerVariants}
          initial='hidden'
          animate='visible'
        >
          <h1 className='text-3xl font-bold mb-8 text-[var(--color-text-primary)]'>
            Your Cart ({cartItems.length}{" "}
            {cartItems.length === 1 ? "item" : "items"})
          </h1>
          <div className='grid grid-cols-1 lg:grid-cols-3 gap-8'>
            <div className='lg:col-span-2 space-y-6'>
              {cartItems.map(({ product, quantity }) => (
                <motion.div
                  key={product._id}
                  variants={itemVariants}
                  className='bg-[var(--color-background-secondary)] rounded-lg shadow-md p-6 border border-[var(--color-border)] hover:border-[var(--color-primary)] transition-all duration-200'
                >
                  <div className='flex items-center gap-6'>
                    <div className='relative w-28 h-28 bg-[var(--color-background-tertiary)] rounded-lg overflow-hidden flex-shrink-0'>
                      <Image
                        src={product.images[0]}
                        alt={product.name}
                        fill
                        className='object-scale-down'
                      />
                    </div>
                    <div className='flex-grow min-w-0'>
                      <h3 className='text-lg font-semibold text-[var(--color-text-primary)] mb-2 truncate'>
                        {product.name}
                      </h3>
                      <p className='text-[var(--color-text-secondary)] mb-4'>
                        $
                        {product.price.toLocaleString("en-US", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </p>
                      <div className='flex items-center gap-4'>
                        <div className='flex items-center rounded-lg overflow-hidden border border-[var(--color-border)]'>
                          <motion.button
                            whileTap={{ scale: 0.95 }}
                            onClick={() =>
                              handleQuantityUpdate(product._id, quantity - 1)
                            }
                            disabled={quantity <= 1}
                            className='p-2 text-[var(--color-text-primary)] hover:bg-[var(--color-background-hover)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
                          >
                            <svg
                              className='w-4 h-4'
                              fill='none'
                              stroke='currentColor'
                              viewBox='0 0 24 24'
                            >
                              <path
                                strokeLinecap='round'
                                strokeLinejoin='round'
                                strokeWidth={2}
                                d='M20 12H4'
                              />
                            </svg>
                          </motion.button>
                          <span className='w-12 text-center py-2 text-[var(--color-text-primary)] font-medium'>
                            {quantity}
                          </span>
                          <motion.button
                            whileTap={{ scale: 0.95 }}
                            onClick={() =>
                              handleQuantityUpdate(product._id, quantity + 1)
                            }
                            disabled={quantity >= product.stock}
                            className='p-2 text-[var(--color-text-primary)] hover:bg-[var(--color-background-hover)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
                          >
                            <svg
                              className='w-4 h-4'
                              fill='none'
                              stroke='currentColor'
                              viewBox='0 0 24 24'
                            >
                              <path
                                strokeLinecap='round'
                                strokeLinejoin='round'
                                strokeWidth={2}
                                d='M12 4v16m8-8H4'
                              />
                            </svg>
                          </motion.button>
                        </div>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleRemoveItem(product._id)}
                          className='text-[var(--color-error)] hover:text-[var(--color-error-hover)] transition-colors'
                        >
                          <svg
                            className='w-5 h-5'
                            fill='none'
                            stroke='currentColor'
                            viewBox='0 0 24 24'
                          >
                            <path
                              strokeLinecap='round'
                              strokeLinejoin='round'
                              strokeWidth={1.5}
                              d='M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16'
                            />
                          </svg>
                        </motion.button>
                      </div>
                    </div>
                    <div className='text-right flex-shrink-0'>
                      <p className='text-xl font-bold text-[var(--color-primary)]'>
                        $
                        {(product.price * quantity).toLocaleString("en-US", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
            <motion.div
              variants={itemVariants}
              className='bg-[var(--color-background-secondary)] rounded-lg shadow-md p-6 border border-[var(--color-border)] h-fit lg:sticky lg:top-24'
            >
              <h2 className='text-xl font-semibold text-[var(--color-text-primary)] mb-6'>
                Order Summary
              </h2>
              <div className='space-y-4'>
                <div className='flex justify-between text-[var(--color-text-secondary)]'>
                  <span>Subtotal</span>
                  <span>
                    $
                    {total.toLocaleString("en-US", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </span>
                </div>
                <div className='flex justify-between text-[var(--color-text-secondary)]'>
                  <span>Shipping</span>
                  <span>Free</span>
                </div>
                <div className='border-t border-[var(--color-border)] pt-4'>
                  <div className='flex justify-between items-baseline'>
                    <span className='font-semibold text-[var(--color-text-primary)]'>
                      Total
                    </span>
                    <span className='text-2xl font-bold text-[var(--color-primary)]'>
                      $
                      {total.toLocaleString("en-US", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </span>
                  </div>
                </div>
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className='pt-4'
                >
                  <Link
                    href='/checkout'
                    className='block text-white w-full text-center py-3 px-4 rounded-lg font-medium text-[var(--color-text-inverse)] bg-[var(--color-primary)] hover:opacity-90 transition-all duration-200'
                  >
                    Proceed to Checkout
                  </Link>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
