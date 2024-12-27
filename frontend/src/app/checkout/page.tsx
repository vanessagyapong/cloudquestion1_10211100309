"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import {
  FiCreditCard,
  FiMapPin,
  FiTruck,
  FiShoppingBag,
  FiArrowLeft,
  FiLock,
} from "react-icons/fi";
import { toast } from "sonner";

const fadeIn = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
};

interface ShippingDetails {
  fullName: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  phone: string;
}

interface PaymentDetails {
  cardNumber: string;
  cardHolder: string;
  expiryDate: string;
  cvv: string;
}

export default function CheckoutPage() {
  const router = useRouter();
  const { items: cartItems, clearCart } = useCart();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [shippingDetails, setShippingDetails] = useState<ShippingDetails>({
    fullName: user?.name || "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    phone: "",
  });
  const [paymentDetails, setPaymentDetails] = useState<PaymentDetails>({
    cardNumber: "",
    cardHolder: "",
    expiryDate: "",
    cvv: "",
  });

  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const shippingCost = 10.0; // Fixed shipping cost
  const tax = subtotal * 0.1; // 10% tax
  const total = subtotal + shippingCost + tax;

  const handleShippingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStep(2);
  };

  const handlePaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStep(3);
  };

  const handlePlaceOrder = async () => {
    setLoading(true);
    try {
      // TODO: Implement order creation API call
      await new Promise((resolve) => setTimeout(resolve, 2000)); // Simulated API call
      await clearCart();
      toast.success("Order placed successfully!");
      router.push("/profile"); // Redirect to profile/orders page
    } catch (error) {
      console.error("Error placing order:", error);
      toast.error("Failed to place order");
    } finally {
      setLoading(false);
    }
  };

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || "";
    const parts = [];

    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }

    if (parts.length) {
      return parts.join(" ");
    } else {
      return value;
    }
  };

  const formatExpiryDate = (value: string) => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
    if (v.length >= 2) {
      return v.slice(0, 2) + "/" + v.slice(2, 4);
    }
    return v;
  };

  if (cartItems.length === 0) {
    return (
      <div className='main-layout'>
        <div className='content-container'>
          <div className='text-center py-12'>
            <div className='max-w-md mx-auto'>
              <h2 className='text-xl font-semibold text-[var(--color-text-primary)] mb-2'>
                Your cart is empty
              </h2>
              <p className='text-[var(--color-text-secondary)] mb-6'>
                Add some items to your cart before checking out
              </p>
              <motion.button
                onClick={() => router.push("/store")}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className='btn-primary inline-flex items-center'
              >
                <FiShoppingBag className='mr-2 h-5 w-5' />
                Continue Shopping
              </motion.button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <div className='main-layout bg-[var(--color-background-secondary)] min-h-screen py-8'>
        <div className='content-container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          {/* Back Button */}
          <button
            onClick={() => router.back()}
            className='flex items-center gap-2 text-[var(--color-text-secondary)] hover:text-[var(--color-primary)] transition-colors duration-200 mb-8 bg-white rounded-lg px-4 py-2 shadow-sm hover:shadow-md'
          >
            <FiArrowLeft className='h-5 w-5' />
            Back to Cart
          </button>

          <div className='grid grid-cols-1 lg:grid-cols-3 gap-8'>
            {/* Main Content */}
            <div className='lg:col-span-2'>
              <div className='space-y-8'>
                {/* Steps */}
                <div className='bg-white rounded-lg shadow-sm p-6 mb-8'>
                  <div className='flex items-center justify-between'>
                    {[
                      { number: 1, title: "Shipping", icon: FiTruck },
                      { number: 2, title: "Payment", icon: FiCreditCard },
                      { number: 3, title: "Review", icon: FiLock },
                    ].map(({ number, title, icon: Icon }) => (
                      <div
                        key={number}
                        className={`flex items-center ${
                          number !== 3 ? "flex-1" : ""
                        }`}
                      >
                        <div
                          className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all duration-300 ${
                            step >= number
                              ? "bg-[var(--color-primary)] border-[var(--color-primary)] text-white"
                              : "bg-white border-[var(--color-border)] text-[var(--color-text-secondary)]"
                          }`}
                        >
                          <Icon className='h-5 w-5' />
                        </div>
                        <div
                          className={`ml-3 font-medium transition-colors duration-300 ${
                            step >= number
                              ? "text-[var(--color-text-primary)]"
                              : "text-[var(--color-text-secondary)]"
                          }`}
                        >
                          {title}
                        </div>
                        {number !== 3 && (
                          <div
                            className={`flex-1 h-0.5 mx-4 rounded transition-colors duration-300 ${
                              step > number
                                ? "bg-[var(--color-primary)]"
                                : "bg-[var(--color-border)]"
                            }`}
                          />
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Forms */}
                {step === 1 && (
                  <motion.form
                    onSubmit={handleShippingSubmit}
                    className='bg-white rounded-lg shadow-sm p-8'
                    initial={fadeIn.initial}
                    animate={fadeIn.animate}
                    exit={fadeIn.exit}
                  >
                    <h2 className='text-2xl font-semibold text-[var(--color-text-primary)] mb-8 flex items-center gap-3 pb-4 border-b border-[var(--color-border)]'>
                      <FiMapPin className='h-6 w-6 text-[var(--color-primary)]' />
                      Shipping Details
                    </h2>
                    <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                      <div>
                        <label className='block text-sm font-medium text-[var(--color-text-secondary)] mb-2'>
                          Full Name
                        </label>
                        <input
                          type='text'
                          value={shippingDetails.fullName}
                          onChange={(e) =>
                            setShippingDetails({
                              ...shippingDetails,
                              fullName: e.target.value,
                            })
                          }
                          className='w-full px-4 py-3 rounded-lg border border-[var(--color-border)] focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)] focus:ring-opacity-20 outline-none transition-all duration-200'
                          required
                        />
                      </div>
                      <div>
                        <label className='block text-sm font-medium text-[var(--color-text-secondary)] mb-2'>
                          Phone Number
                        </label>
                        <input
                          type='tel'
                          value={shippingDetails.phone}
                          onChange={(e) =>
                            setShippingDetails({
                              ...shippingDetails,
                              phone: e.target.value,
                            })
                          }
                          className='w-full px-4 py-3 rounded-lg border border-[var(--color-border)] focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)] focus:ring-opacity-20 outline-none transition-all duration-200'
                          required
                        />
                      </div>
                      <div className='md:col-span-2'>
                        <label className='block text-sm font-medium text-[var(--color-text-secondary)] mb-2'>
                          Address
                        </label>
                        <input
                          type='text'
                          value={shippingDetails.address}
                          onChange={(e) =>
                            setShippingDetails({
                              ...shippingDetails,
                              address: e.target.value,
                            })
                          }
                          className='w-full px-4 py-3 rounded-lg border border-[var(--color-border)] focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)] focus:ring-opacity-20 outline-none transition-all duration-200'
                          required
                        />
                      </div>
                      <div>
                        <label className='block text-sm font-medium text-[var(--color-text-secondary)] mb-2'>
                          City
                        </label>
                        <input
                          type='text'
                          value={shippingDetails.city}
                          onChange={(e) =>
                            setShippingDetails({
                              ...shippingDetails,
                              city: e.target.value,
                            })
                          }
                          className='w-full px-4 py-3 rounded-lg border border-[var(--color-border)] focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)] focus:ring-opacity-20 outline-none transition-all duration-200'
                          required
                        />
                      </div>
                      <div>
                        <label className='block text-sm font-medium text-[var(--color-text-secondary)] mb-2'>
                          State
                        </label>
                        <input
                          type='text'
                          value={shippingDetails.state}
                          onChange={(e) =>
                            setShippingDetails({
                              ...shippingDetails,
                              state: e.target.value,
                            })
                          }
                          className='w-full px-4 py-3 rounded-lg border border-[var(--color-border)] focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)] focus:ring-opacity-20 outline-none transition-all duration-200'
                          required
                        />
                      </div>
                      <div>
                        <label className='block text-sm font-medium text-[var(--color-text-secondary)] mb-2'>
                          ZIP Code
                        </label>
                        <input
                          type='text'
                          value={shippingDetails.zipCode}
                          onChange={(e) =>
                            setShippingDetails({
                              ...shippingDetails,
                              zipCode: e.target.value,
                            })
                          }
                          className='w-full px-4 py-3 rounded-lg border border-[var(--color-border)] focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)] focus:ring-opacity-20 outline-none transition-all duration-200'
                          required
                        />
                      </div>
                    </div>
                    <div className='mt-8'>
                      <motion.button
                        type='submit'
                        className='btn-primary w-full py-3 text-lg font-medium shadow-lg shadow-[var(--color-primary)]/20'
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        Continue to Payment
                      </motion.button>
                    </div>
                  </motion.form>
                )}

                {/* Payment Form with similar enhanced styling */}
                {step === 2 && (
                  <motion.form
                    onSubmit={handlePaymentSubmit}
                    className='bg-white rounded-lg shadow-sm p-8'
                    initial={fadeIn.initial}
                    animate={fadeIn.animate}
                    exit={fadeIn.exit}
                  >
                    <h2 className='text-2xl font-semibold text-[var(--color-text-primary)] mb-8 flex items-center gap-3 pb-4 border-b border-[var(--color-border)]'>
                      <FiCreditCard className='h-6 w-6 text-[var(--color-primary)]' />
                      Payment Details
                    </h2>
                    <div className='space-y-6'>
                      <div>
                        <label className='block text-sm font-medium text-[var(--color-text-secondary)] mb-2'>
                          Card Number
                        </label>
                        <input
                          type='text'
                          value={paymentDetails.cardNumber}
                          onChange={(e) =>
                            setPaymentDetails({
                              ...paymentDetails,
                              cardNumber: formatCardNumber(e.target.value),
                            })
                          }
                          maxLength={19}
                          className='w-full px-4 py-3 rounded-lg border border-[var(--color-border)] focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)] focus:ring-opacity-20 outline-none transition-all duration-200'
                          placeholder='0000 0000 0000 0000'
                          required
                        />
                      </div>
                      <div>
                        <label className='block text-sm font-medium text-[var(--color-text-secondary)] mb-2'>
                          Card Holder Name
                        </label>
                        <input
                          type='text'
                          value={paymentDetails.cardHolder}
                          onChange={(e) =>
                            setPaymentDetails({
                              ...paymentDetails,
                              cardHolder: e.target.value,
                            })
                          }
                          className='w-full px-4 py-3 rounded-lg border border-[var(--color-border)] focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)] focus:ring-opacity-20 outline-none transition-all duration-200'
                          required
                        />
                      </div>
                      <div className='grid grid-cols-2 gap-6'>
                        <div>
                          <label className='block text-sm font-medium text-[var(--color-text-secondary)] mb-2'>
                            Expiry Date
                          </label>
                          <input
                            type='text'
                            value={paymentDetails.expiryDate}
                            onChange={(e) =>
                              setPaymentDetails({
                                ...paymentDetails,
                                expiryDate: formatExpiryDate(e.target.value),
                              })
                            }
                            maxLength={5}
                            className='w-full px-4 py-3 rounded-lg border border-[var(--color-border)] focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)] focus:ring-opacity-20 outline-none transition-all duration-200'
                            placeholder='MM/YY'
                            required
                          />
                        </div>
                        <div>
                          <label className='block text-sm font-medium text-[var(--color-text-secondary)] mb-2'>
                            CVV
                          </label>
                          <input
                            type='text'
                            value={paymentDetails.cvv}
                            onChange={(e) =>
                              setPaymentDetails({
                                ...paymentDetails,
                                cvv: e.target.value
                                  .replace(/\D/g, "")
                                  .slice(0, 3),
                              })
                            }
                            maxLength={3}
                            className='w-full px-4 py-3 rounded-lg border border-[var(--color-border)] focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)] focus:ring-opacity-20 outline-none transition-all duration-200'
                            required
                          />
                        </div>
                      </div>
                    </div>
                    <div className='mt-8 flex items-center gap-4'>
                      <motion.button
                        type='button'
                        onClick={() => setStep(1)}
                        className='btn-secondary flex-1'
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        Back
                      </motion.button>
                      <motion.button
                        type='submit'
                        className='btn-primary flex-1'
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        Review Order
                      </motion.button>
                    </div>
                  </motion.form>
                )}

                {/* Review section with similar enhanced styling */}
                {step === 3 && (
                  <motion.div
                    className='bg-white rounded-lg shadow-sm p-8'
                    initial={fadeIn.initial}
                    animate={fadeIn.animate}
                    exit={fadeIn.exit}
                  >
                    <h2 className='text-2xl font-semibold text-[var(--color-text-primary)] mb-8 flex items-center gap-3 pb-4 border-b border-[var(--color-border)]'>
                      <FiLock className='h-6 w-6 text-[var(--color-primary)]' />
                      Review Order
                    </h2>
                    <div className='space-y-6'>
                      {/* Shipping Details Review */}
                      <div>
                        <h3 className='text-lg font-medium text-[var(--color-text-primary)] mb-2'>
                          Shipping Details
                        </h3>
                        <div className='text-[var(--color-text-secondary)]'>
                          <p>{shippingDetails.fullName}</p>
                          <p>{shippingDetails.phone}</p>
                          <p>{shippingDetails.address}</p>
                          <p>
                            {shippingDetails.city}, {shippingDetails.state}{" "}
                            {shippingDetails.zipCode}
                          </p>
                        </div>
                      </div>

                      {/* Payment Details Review */}
                      <div>
                        <h3 className='text-lg font-medium text-[var(--color-text-primary)] mb-2'>
                          Payment Details
                        </h3>
                        <div className='text-[var(--color-text-secondary)]'>
                          <p>
                            Card ending in {paymentDetails.cardNumber.slice(-4)}
                          </p>
                          <p>{paymentDetails.cardHolder}</p>
                          <p>Expires {paymentDetails.expiryDate}</p>
                        </div>
                      </div>

                      <div className='mt-6 flex items-center gap-4'>
                        <motion.button
                          type='button'
                          onClick={() => setStep(2)}
                          className='btn-secondary flex-1'
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          Back
                        </motion.button>
                        <motion.button
                          onClick={handlePlaceOrder}
                          disabled={loading}
                          className='btn-primary flex-1'
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          {loading ? (
                            <div className='h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto' />
                          ) : (
                            "Place Order"
                          )}
                        </motion.button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>
            </div>

            {/* Order Summary with enhanced styling */}
            <div className='lg:col-span-1'>
              <div className='bg-white rounded-lg shadow-sm p-8 sticky top-6'>
                <h2 className='text-2xl font-semibold text-[var(--color-text-primary)] mb-8 pb-4 border-b border-[var(--color-border)]'>
                  Order Summary
                </h2>
                <div className='space-y-4 mb-6'>
                  {cartItems.map((item) => (
                    <div
                      key={item.product._id}
                      className='flex items-center gap-4'
                    >
                      <div className='relative w-16 h-16 flex-shrink-0'>
                        <Image
                          src={item.product.images[0]}
                          alt={item.product.name}
                          fill
                          className='object-cover rounded-lg'
                        />
                      </div>
                      <div className='flex-1 min-w-0'>
                        <h3 className='text-sm font-medium text-[var(--color-text-primary)] truncate'>
                          {item.product.name}
                        </h3>
                        <p className='text-sm text-[var(--color-text-secondary)]'>
                          Qty: {item.quantity}
                        </p>
                      </div>
                      <div className='text-sm font-medium text-[var(--color-text-primary)]'>
                        ${(item.price * item.quantity).toFixed(2)}
                      </div>
                    </div>
                  ))}
                </div>
                <div className='border-t border-[var(--color-border)] pt-4 space-y-2'>
                  <div className='flex justify-between text-[var(--color-text-secondary)]'>
                    <span>Subtotal</span>
                    <span>${subtotal.toFixed(2)}</span>
                  </div>
                  <div className='flex justify-between text-[var(--color-text-secondary)]'>
                    <span>Shipping</span>
                    <span>${shippingCost.toFixed(2)}</span>
                  </div>
                  <div className='flex justify-between text-[var(--color-text-secondary)]'>
                    <span>Tax</span>
                    <span>${tax.toFixed(2)}</span>
                  </div>
                  <div className='flex justify-between text-lg font-bold text-[var(--color-text-primary)] pt-2 border-t border-[var(--color-border)]'>
                    <span>Total</span>
                    <span>${total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
