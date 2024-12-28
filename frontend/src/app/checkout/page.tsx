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
  FiTruck,
  FiShoppingBag,
  FiArrowLeft,
  FiLock,
} from "react-icons/fi";
import { toast } from "sonner";
import { ordersApi } from "@/services/api";
import { CreateOrderData } from "@/types/order";

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
  country: string;
}

interface PaymentDetails {
  cardNumber: string;
  cardHolder: string;
  expiryDate: string;
  cvv: string;
}

const initialShippingDetails: ShippingDetails = {
  fullName: "",
  address: "",
  city: "",
  state: "",
  zipCode: "",
  phone: "",
  country: "",
};

const initialPaymentDetails: PaymentDetails = {
  cardNumber: "",
  cardHolder: "",
  expiryDate: "",
  cvv: "",
};

export default function CheckoutPage() {
  const router = useRouter();
  const { items: cartItems = [], clearCart } = useCart();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [shippingDetails, setShippingDetails] = useState<ShippingDetails>({
    ...initialShippingDetails,
    fullName: user?.name || "",
  });
  const [paymentDetails, setPaymentDetails] = useState<PaymentDetails>(
    initialPaymentDetails
  );

  const subtotal = cartItems.reduce(
    (sum, item) => sum + (item.price || 0) * (item.quantity || 1),
    0
  );
  const shippingCost = 10.0;
  const tax = subtotal * 0.1;
  const total = subtotal + shippingCost + tax;

  const handleShippingSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStep(2);
  };

  const handlePaymentSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStep(3);
  };

  const handlePlaceOrder = async () => {
    try {
      setLoading(true);

      // Calculate estimated delivery date (7 days from now)
      const estimatedDeliveryDate = new Date();
      estimatedDeliveryDate.setDate(estimatedDeliveryDate.getDate() + 7);

      const orderData: CreateOrderData = {
        items: cartItems.map((item) => ({
          product: item.product._id,
          quantity: item.quantity,
          price: item.price * item.quantity, // Store the actual price paid
        })),
        totalAmount: total,
        shippingAddress: {
          street: shippingDetails.address,
          city: shippingDetails.city,
          state: shippingDetails.state,
          country: shippingDetails.country,
          zipCode: shippingDetails.zipCode,
        },
        status: "pending",
        paymentStatus: "pending",
        paymentMethod: {
          type: "card",
          details: {
            name: paymentDetails.cardHolder,
            number: paymentDetails.cardNumber.replace(/\s/g, ""),
            expiry: paymentDetails.expiryDate,
            cvv: paymentDetails.cvv,
          },
        },
        estimatedDeliveryDate: estimatedDeliveryDate.toISOString(),
      };

      await ordersApi.createOrder(orderData);
      await clearCart();
      toast.success("Order placed successfully!");
      router.push("/profile");
    } catch (error) {
      console.error("Error placing order:", error);
      toast.error("Failed to place order. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const formatCardNumber = (value: string): string => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || "";
    const parts = [];

    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }

    return parts.length ? parts.join(" ") : value;
  };

  const formatExpiryDate = (value: string): string => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
    if (v.length >= 2) {
      return v.slice(0, 2) + "/" + v.slice(2, 4);
    }
    return v;
  };

  // Empty cart state
  if (!cartItems || cartItems.length === 0) {
    return (
      <div className='main-layout bg-[var(--color-background-secondary)] min-h-screen py-8'>
        <div className='content-container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='text-center py-12'>
            <div className='max-w-md mx-auto bg-white rounded-lg shadow-sm p-8'>
              <h2 className='text-xl font-semibold text-[var(--color-text-primary)] mb-4'>
                Your cart is empty
              </h2>
              <p className='text-[var(--color-text-secondary)] mb-6'>
                Add some items to your cart before checking out
              </p>
              <motion.button
                onClick={() => router.push("/store")}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className='btn-primary inline-flex items-center px-6 py-3'
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
                    <h2 className='text-2xl font-bold text-[var(--color-text-primary)] mb-6'>
                      Shipping Information
                    </h2>
                    <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                      <div>
                        <label
                          htmlFor='fullName'
                          className='block text-sm font-medium text-[var(--color-text-primary)]'
                        >
                          Full Name
                        </label>
                        <input
                          type='text'
                          id='fullName'
                          name='fullName'
                          value={shippingDetails.fullName}
                          onChange={(e) =>
                            setShippingDetails({
                              ...shippingDetails,
                              fullName: e.target.value,
                            })
                          }
                          required
                          autoComplete='name'
                          className='mt-1 block w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-background-secondary)] px-4 py-2 text-[var(--color-text-primary)] focus:border-[var(--color-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)]'
                        />
                      </div>
                      <div>
                        <label
                          htmlFor='phone'
                          className='block text-sm font-medium text-[var(--color-text-primary)]'
                        >
                          Phone Number
                        </label>
                        <input
                          type='tel'
                          id='phone'
                          name='phone'
                          value={shippingDetails.phone}
                          onChange={(e) =>
                            setShippingDetails({
                              ...shippingDetails,
                              phone: e.target.value,
                            })
                          }
                          required
                          autoComplete='tel'
                          className='mt-1 block w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-background-secondary)] px-4 py-2 text-[var(--color-text-primary)] focus:border-[var(--color-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)]'
                        />
                      </div>
                      <div className='md:col-span-2'>
                        <label
                          htmlFor='address'
                          className='block text-sm font-medium text-[var(--color-text-primary)]'
                        >
                          Street Address
                        </label>
                        <input
                          type='text'
                          id='address'
                          name='address'
                          value={shippingDetails.address}
                          onChange={(e) =>
                            setShippingDetails({
                              ...shippingDetails,
                              address: e.target.value,
                            })
                          }
                          required
                          autoComplete='street-address'
                          className='mt-1 block w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-background-secondary)] px-4 py-2 text-[var(--color-text-primary)] focus:border-[var(--color-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)]'
                        />
                      </div>
                      <div>
                        <label
                          htmlFor='city'
                          className='block text-sm font-medium text-[var(--color-text-primary)]'
                        >
                          City
                        </label>
                        <input
                          type='text'
                          id='city'
                          name='city'
                          value={shippingDetails.city}
                          onChange={(e) =>
                            setShippingDetails({
                              ...shippingDetails,
                              city: e.target.value,
                            })
                          }
                          required
                          autoComplete='address-level2'
                          className='mt-1 block w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-background-secondary)] px-4 py-2 text-[var(--color-text-primary)] focus:border-[var(--color-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)]'
                        />
                      </div>
                      <div>
                        <label
                          htmlFor='state'
                          className='block text-sm font-medium text-[var(--color-text-primary)]'
                        >
                          State / Province
                        </label>
                        <input
                          type='text'
                          id='state'
                          name='state'
                          value={shippingDetails.state}
                          onChange={(e) =>
                            setShippingDetails({
                              ...shippingDetails,
                              state: e.target.value,
                            })
                          }
                          required
                          autoComplete='address-level1'
                          className='mt-1 block w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-background-secondary)] px-4 py-2 text-[var(--color-text-primary)] focus:border-[var(--color-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)]'
                        />
                      </div>
                      <div>
                        <label
                          htmlFor='zipCode'
                          className='block text-sm font-medium text-[var(--color-text-primary)]'
                        >
                          ZIP / Postal Code
                        </label>
                        <input
                          type='text'
                          id='zipCode'
                          name='zipCode'
                          value={shippingDetails.zipCode}
                          onChange={(e) =>
                            setShippingDetails({
                              ...shippingDetails,
                              zipCode: e.target.value,
                            })
                          }
                          required
                          autoComplete='postal-code'
                          className='mt-1 block w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-background-secondary)] px-4 py-2 text-[var(--color-text-primary)] focus:border-[var(--color-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)]'
                        />
                      </div>
                      <div>
                        <label
                          htmlFor='country'
                          className='block text-sm font-medium text-[var(--color-text-primary)]'
                        >
                          Country
                        </label>
                        <input
                          type='text'
                          id='country'
                          name='country'
                          value={shippingDetails.country}
                          onChange={(e) =>
                            setShippingDetails({
                              ...shippingDetails,
                              country: e.target.value,
                            })
                          }
                          required
                          autoComplete='country-name'
                          className='mt-1 block w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-background-secondary)] px-4 py-2 text-[var(--color-text-primary)] focus:border-[var(--color-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)]'
                        />
                      </div>
                    </div>
                    <div className='mt-8 flex justify-end'>
                      <motion.button
                        type='submit'
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className='btn-primary px-8 py-2'
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
                    <h2 className='text-2xl font-bold text-[var(--color-text-primary)] mb-6'>
                      Payment Information
                    </h2>
                    <div className='space-y-6'>
                      <div>
                        <label
                          htmlFor='cardHolder'
                          className='block text-sm font-medium text-[var(--color-text-primary)]'
                        >
                          Card Holder Name
                        </label>
                        <input
                          type='text'
                          id='cardHolder'
                          name='cardHolder'
                          value={paymentDetails.cardHolder}
                          onChange={(e) =>
                            setPaymentDetails({
                              ...paymentDetails,
                              cardHolder: e.target.value,
                            })
                          }
                          required
                          autoComplete='cc-name'
                          className='mt-1 block w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-background-secondary)] px-4 py-2 text-[var(--color-text-primary)] focus:border-[var(--color-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)]'
                        />
                      </div>
                      <div>
                        <label
                          htmlFor='cardNumber'
                          className='block text-sm font-medium text-[var(--color-text-primary)]'
                        >
                          Card Number
                        </label>
                        <input
                          type='text'
                          id='cardNumber'
                          name='cardNumber'
                          value={paymentDetails.cardNumber}
                          onChange={(e) =>
                            setPaymentDetails({
                              ...paymentDetails,
                              cardNumber: formatCardNumber(e.target.value),
                            })
                          }
                          required
                          maxLength={19}
                          autoComplete='cc-number'
                          className='mt-1 block w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-background-secondary)] px-4 py-2 text-[var(--color-text-primary)] focus:border-[var(--color-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)]'
                        />
                      </div>
                      <div className='grid grid-cols-2 gap-6'>
                        <div>
                          <label
                            htmlFor='expiryDate'
                            className='block text-sm font-medium text-[var(--color-text-primary)]'
                          >
                            Expiry Date (MM/YY)
                          </label>
                          <input
                            type='text'
                            id='expiryDate'
                            name='expiryDate'
                            value={paymentDetails.expiryDate}
                            onChange={(e) =>
                              setPaymentDetails({
                                ...paymentDetails,
                                expiryDate: formatExpiryDate(e.target.value),
                              })
                            }
                            required
                            maxLength={5}
                            autoComplete='cc-exp'
                            className='mt-1 block w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-background-secondary)] px-4 py-2 text-[var(--color-text-primary)] focus:border-[var(--color-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)]'
                          />
                        </div>
                        <div>
                          <label
                            htmlFor='cvv'
                            className='block text-sm font-medium text-[var(--color-text-primary)]'
                          >
                            CVV
                          </label>
                          <input
                            type='text'
                            id='cvv'
                            name='cvv'
                            value={paymentDetails.cvv}
                            onChange={(e) =>
                              setPaymentDetails({
                                ...paymentDetails,
                                cvv: e.target.value
                                  .replace(/\D/g, "")
                                  .slice(0, 4),
                              })
                            }
                            required
                            maxLength={4}
                            autoComplete='cc-csc'
                            className='mt-1 block w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-background-secondary)] px-4 py-2 text-[var(--color-text-primary)] focus:border-[var(--color-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)]'
                          />
                        </div>
                      </div>
                    </div>
                    <div className='mt-8 flex justify-between'>
                      <motion.button
                        type='button'
                        onClick={() => setStep(1)}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className='btn-secondary px-8 py-2'
                      >
                        Back
                      </motion.button>
                      <motion.button
                        type='submit'
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className='btn-primary px-8 py-2'
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
                          className='object-scale-down rounded-lg'
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
