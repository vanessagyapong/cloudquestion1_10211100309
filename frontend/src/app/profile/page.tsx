/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import ProtectedRoute from "../../components/ProtectedRoute";
import { toast } from "sonner";
import { userApi, storeApi, ordersApi } from "@/services/api";
import { Tab } from "@headlessui/react";
import {
  FiUser,
  FiShoppingBag,
  FiSettings,
  FiShoppingCart,
  FiPhone,
  FiMapPin,
  FiInfo,
  FiEdit,
  FiTrash2,
  FiLock,
  FiMail,
  FiAlertTriangle,
  FiTruck,
} from "react-icons/fi";
import { motion } from "framer-motion";
import { Store, StoreCreationData } from "@/types/user";
import Image from "next/image";
import { useCart } from "@/contexts/CartContext";
import { Order } from "@/types/order";
import { useRouter } from "next/navigation";
import { Product } from "@/types/product";

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(" ");
}

const fadeIn = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
};

const tabs = [
  { name: "Profile", icon: <FiUser className='h-5 w-5' /> },
  { name: "Seller", icon: <FiShoppingBag className='h-5 w-5' /> },
  { name: "Orders", icon: <FiShoppingCart className='h-5 w-5' /> },
  { name: "Settings", icon: <FiSettings className='h-5 w-5' /> },
];
export default function ProfilePage() {
  const { user, refreshUser } = useAuth();
  const [store, setStore] = useState<Store>();
  const { items: cartItems } = useCart();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [orders, setOrders] = useState<Order[]>([]);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [storeFormData, setStoreFormData] = useState<StoreCreationData>({
    name: "",
    description: "",
    contactPhone: "",
    address: "",
  });
  const [isSubmittingSeller, setIsSubmittingSeller] = useState(false);
  const [isSubmittingProfile, setIsSubmittingProfile] = useState(false);
  const [isSubmittingPassword, setIsSubmittingPassword] = useState(false);
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (user) {
      setName(user.name);
      setEmail(user.email);
    }
  }, [user]);

  useEffect(() => {
    const fetchMyStore = async () => {
      if (user && !store) {
        const res = await storeApi.getMyStore();

        if (res) {
          // @ts-expect-error - store may be undefined
          setStore(res?.data?.data?.store as unknown as Store);
          console.log(res?.data?.data);
          // @ts-expect-error - orders may be undefined
          setOrders(res?.data?.data?.orders?.all as unknown as Order[]);
        }
      }
    };

    const fetchMyOrders = async () => {
      if (user && !orders.length) {
        const res = await ordersApi.getMyOrders();
        setOrders(res?.data?.data as unknown as Order[]);
      }
    };

    if (user?.role === "seller") {
      fetchMyStore();
    }

    fetchMyOrders();
  }, [user, store]);

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingProfile(true);

    try {
      await userApi.updateProfile({
        name,
        email,
      });
      await refreshUser();
      toast.success("Profile updated successfully");
    } catch (error: any) {
      console.error("Profile update error:", error);
      toast.error(error.response?.data?.message || "Failed to update profile");
    } finally {
      setIsSubmittingProfile(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }

    setIsSubmittingPassword(true);
    try {
      await userApi.changePassword(currentPassword, newPassword);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      toast.success("Password changed successfully");
    } catch (error: any) {
      console.error("Password change error:", error);
      toast.error(error.response?.data?.message || "Failed to change password");
    } finally {
      setIsSubmittingPassword(false);
    }
  };

  const handleDeleteAccount = async () => {
    try {
      await userApi.deleteProfile();
      toast.success("Account deleted successfully");
      // User will be redirected by the auth interceptor
    } catch (error: any) {
      console.error("Account deletion error:", error);
      toast.error(error.response?.data?.message || "Failed to delete account");
    }
  };

  const handleSellerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate required fields
    if (!storeFormData.name.trim()) {
      toast.error("Store name is required");
      return;
    }

    if (!storeFormData.description.trim()) {
      toast.error("Store description is required");
      return;
    }

    setIsSubmittingSeller(true);
    try {
      await userApi.becomeSeller(storeFormData);
      toast.success("Store application submitted successfully");
    } catch (error: any) {
      console.error("Seller application error:", error);
      toast.error(
        error.response?.data?.message || "Failed to submit application"
      );
    } finally {
      setIsSubmittingSeller(false);
    }
  };

  const renderStoreForm = () => (
    <motion.div
      className='bg-[var(--color-bg-primary)] p-8 rounded-lg shadow-lg'
      initial={fadeIn.initial}
      animate={fadeIn.animate}
      exit={fadeIn.exit}
    >
      <div className='mb-8'>
        <h2 className='text-2xl font-bold text-[var(--color-text-primary)] mb-2'>
          Become a Seller
        </h2>
        <p className='text-[var(--color-text-secondary)]'>
          Start your journey as a seller by setting up your store profile. Fill
          out the details below.
        </p>
      </div>

      <motion.form onSubmit={handleSellerSubmit} className='space-y-8'>
        {/* Store Basic Info Section */}
        <div className='space-y-6'>
          <h3 className='text-lg font-semibold text-[var(--color-text-primary)] flex items-center'>
            <FiInfo className='mr-2' />
            Basic Information
          </h3>

          <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
            <div className='space-y-2'>
              <label className='block text-sm font-medium text-[var(--color-text-primary)]'>
                <FiShoppingBag className='inline-block mr-2' />
                Store Name <span className='text-red-500'>*</span>
              </label>
              <input
                type='text'
                value={storeFormData.name}
                onChange={(e) =>
                  setStoreFormData({ ...storeFormData, name: e.target.value })
                }
                className='input-primary w-full transition-all duration-200 border border-[var(--color-border)] focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-lg'
                placeholder='Enter your store name'
                required
              />
              <p className='text-xs text-[var(--color-text-secondary)]'>
                Choose a unique and memorable name for your store
              </p>
            </div>

            <div className='space-y-2'>
              <label className='block text-sm font-medium text-[var(--color-text-primary)]'>
                <FiPhone className='inline-block mr-2' />
                Contact Phone <span className='text-red-500'>*</span>
              </label>
              <input
                type='tel'
                value={storeFormData.contactPhone}
                onChange={(e) =>
                  setStoreFormData({
                    ...storeFormData,
                    contactPhone: e.target.value,
                  })
                }
                className='input-primary w-full transition-all duration-200 border border-[var(--color-border)] focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-lg'
                placeholder='Enter contact number'
                required
              />
              <p className='text-xs text-[var(--color-text-secondary)]'>
                This number will be used for business communications
              </p>
            </div>
          </div>
        </div>

        {/* Store Details Section */}
        <div className='space-y-6 pt-6 border-t border-[var(--color-border)]'>
          <h3 className='text-lg font-semibold text-[var(--color-text-primary)] flex items-center'>
            <FiInfo className='mr-2' />
            Store Details
          </h3>

          <div className='space-y-2'>
            <label className='block text-sm font-medium text-[var(--color-text-primary)]'>
              <FiInfo className='inline-block mr-2' />
              Store Description <span className='text-red-500'>*</span>
            </label>
            <textarea
              value={storeFormData.description}
              onChange={(e) =>
                setStoreFormData({
                  ...storeFormData,
                  description: e.target.value,
                })
              }
              rows={4}
              className='input-primary w-full transition-all duration-200 border border-[var(--color-border)] focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-lg resize-none'
              placeholder='Describe your store and what you sell...'
              required
            />
            <p className='text-xs text-[var(--color-text-secondary)]'>
              Provide a detailed description of your store and the products you
              plan to sell
            </p>
          </div>

          <div className='space-y-2'>
            <label className='block text-sm font-medium text-[var(--color-text-primary)]'>
              <FiMapPin className='inline-block mr-2' />
              Store Address <span className='text-red-500'>*</span>
            </label>
            <textarea
              value={storeFormData.address}
              onChange={(e) =>
                setStoreFormData({ ...storeFormData, address: e.target.value })
              }
              rows={3}
              className='input-primary w-full transition-all duration-200 border border-[var(--color-border)] focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-lg resize-none'
              placeholder='Enter your business address'
              required
            />
            <p className='text-xs text-[var(--color-text-secondary)]'>
              This address will be used for business verification and shipping
            </p>
          </div>
        </div>

        {/* Terms and Submit Section */}
        <div className='pt-6 border-t border-[var(--color-border)]'>
          <p className='text-sm text-[var(--color-text-secondary)] mb-6'>
            By submitting this form, you agree to our{" "}
            <a href='#' className='text-blue-500 hover:text-blue-600'>
              Terms of Service
            </a>{" "}
            and{" "}
            <a href='#' className='text-blue-500 hover:text-blue-600'>
              Seller Guidelines
            </a>
            .
          </p>

          <motion.button
            type='submit'
            disabled={isSubmittingSeller}
            className='btn-primary w-full flex items-center justify-center py-3 text-base'
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {isSubmittingSeller ? (
              <>
                <svg
                  className='animate-spin -ml-1 mr-3 h-5 w-5 text-white'
                  xmlns='http://www.w3.org/2000/svg'
                  fill='none'
                  viewBox='0 0 24 24'
                >
                  <circle
                    className='opacity-25'
                    cx='12'
                    cy='12'
                    r='10'
                    stroke='currentColor'
                    strokeWidth='4'
                  ></circle>
                  <path
                    className='opacity-75'
                    fill='currentColor'
                    d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
                  ></path>
                </svg>
                Submitting Application...
              </>
            ) : (
              <>
                <FiEdit className='mr-2 h-5 w-5' />
                Submit Application
              </>
            )}
          </motion.button>
        </div>
      </motion.form>
    </motion.div>
  );

  const renderStoreStatus = () => {
    if (
      user?.role !== "seller" ||
      store?.status === "pending" ||
      store?.status === "rejected"
    )
      return null;

    return (
      <motion.div
        className='bg-[var(--color-bg-primary)] p-6 rounded-lg shadow-lg mt-6'
        initial={fadeIn.initial}
        animate={fadeIn.animate}
      >
        <div className='flex items-center justify-between mb-4'>
          <h3 className='text-xl font-semibold text-[var(--color-text-primary)]'>
            Store Status
          </h3>
          <span
            className={classNames(
              "status-badge",
              store?.status === "approved"
                ? "status-badge-success"
                : store?.status === "rejected"
                ? "status-badge-error"
                : "status-badge-warning"
            )}
          >
            {store?.status
              ? store.status.charAt(0).toUpperCase() + store.status.slice(1)
              : ""}
          </span>
        </div>
        <div className='space-y-4'>
          <div className='flex items-center'>
            <FiShoppingBag className='text-[var(--color-text-secondary)] mr-2' />
            <span className='text-[var(--color-text-secondary)]'>Name:</span>
            <span className='ml-2 text-[var(--color-text-primary)]'>
              {store?.name}
            </span>
          </div>
          <div className='flex items-start'>
            <FiInfo className='text-[var(--color-text-secondary)] mr-2 mt-1' />
            <span className='text-[var(--color-text-secondary)]'>
              Description:
            </span>
            <span className='ml-2 text-[var(--color-text-primary)]'>
              {store?.description}
            </span>
          </div>
          {store?.contactPhone && (
            <div className='flex items-center'>
              <FiPhone className='text-[var(--color-text-secondary)] mr-2' />
              <span className='text-[var(--color-text-secondary)]'>
                Contact:
              </span>
              <span className='ml-2 text-[var(--color-text-primary)]'>
                {store?.contactPhone}
              </span>
            </div>
          )}
          {store?.address && (
            <div className='flex items-center'>
              <FiMapPin className='text-[var(--color-text-secondary)] mr-2' />
              <span className='text-[var(--color-text-secondary)]'>
                Address:
              </span>
              <span className='ml-2 text-[var(--color-text-primary)]'>
                {store?.address}
              </span>
            </div>
          )}
        </div>
      </motion.div>
    );
  };

  const renderProfileForm = () => (
    <motion.div
      className='bg-[var(--color-bg-primary)] p-6 rounded-lg shadow-lg'
      initial={fadeIn.initial}
      animate={fadeIn.animate}
    >
      <h2 className='text-2xl font-bold text-[var(--color-text-primary)] mb-6'>
        Profile Settings
      </h2>
      <form onSubmit={handleProfileUpdate} className='space-y-6'>
        <div className='form-group'>
          <label className='form-label form-label-required'>
            <FiUser className='inline-block mr-2' />
            Full Name
          </label>
          <input
            type='text'
            value={name}
            onChange={(e) => setName(e.target.value)}
            className='input-primary'
            required
          />
        </div>

        <div>
          <label className='block text-sm font-medium text-gray-300'>
            <FiMail className='inline-block mr-2' />
            Email Address
          </label>
          <input
            type='email'
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className='input-primary'
            required
          />
        </div>

        <motion.button
          type='submit'
          disabled={isSubmittingProfile}
          className='btn-primary w-full flex items-center justify-center'
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <FiEdit className='mr-2' />
          {isSubmittingProfile ? "Updating..." : "Update Profile"}
        </motion.button>
      </form>
    </motion.div>
  );

  const renderOrders = () => (
    <motion.div
      className='bg-[var(--color-bg-primary)] p-6 rounded-lg shadow-lg'
      initial={fadeIn.initial}
      animate={fadeIn.animate}
    >
      <h2 className='text-2xl font-bold text-[var(--color-text-primary)] mb-6'>
        Your Orders
      </h2>
      {orders?.length > 0 ? (
        <div className='space-y-6'>
          {orders?.map((order) => (
            <motion.div
              key={order._id}
              className='bg-[var(--color-bg-primary)] rounded-xl shadow-md overflow-hidden border border-[var(--color-border)] hover:shadow-lg transition-all duration-200'
              whileHover={{ scale: 1.005 }}
              transition={{ duration: 0.2 }}
            >
              {/* Order Header */}
              <div className='bg-[var(--color-background-secondary)] px-6 py-4 border-b border-[var(--color-border)]'>
                <div className='flex flex-wrap items-center justify-between gap-4'>
                  <div className='space-y-1.5'>
                    <div className='flex items-center gap-2'>
                      <span className='text-xs px-2 py-0.5 bg-[var(--color-bg-primary)] rounded-full text-[var(--color-text-secondary)]'>
                        #{order._id.slice(-8).toUpperCase()}
                      </span>
                      <span className='text-xs text-[var(--color-text-secondary)]'>
                        •
                      </span>
                      <span className='text-xs text-[var(--color-text-secondary)]'>
                        {new Date(order.createdAt).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </span>
                    </div>
                    <div className='flex items-center gap-2'>
                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-medium capitalize
                        ${
                          order.status === "delivered"
                            ? "bg-green-100 text-green-800"
                            : order.status === "cancelled"
                            ? "bg-red-100 text-red-800"
                            : order.status === "processing"
                            ? "bg-blue-100 text-blue-800"
                            : order.status === "shipped"
                            ? "bg-purple-100 text-purple-800"
                            : order.status === "confirmed"
                            ? "bg-teal-100 text-teal-800"
                            : order.status === "packed"
                            ? "bg-indigo-100 text-indigo-800"
                            : order.status === "out_for_delivery"
                            ? "bg-violet-100 text-violet-800"
                            : order.status === "returned"
                            ? "bg-orange-100 text-orange-800"
                            : order.status === "refunded"
                            ? "bg-rose-100 text-rose-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        Order: {order.status.split("_").join(" ")}
                      </span>
                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-medium capitalize
                        ${
                          order.paymentStatus === "completed"
                            ? "bg-green-100 text-green-800"
                            : order.paymentStatus === "processing"
                            ? "bg-blue-100 text-blue-800"
                            : order.paymentStatus === "refunded"
                            ? "bg-orange-100 text-orange-800"
                            : order.paymentStatus === "failed"
                            ? "bg-red-100 text-red-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        Payment: {order.paymentStatus}
                      </span>
                    </div>
                  </div>
                  <div className='text-right'>
                    <p className='text-lg font-bold text-[var(--color-text-primary)]'>
                      {order.totalAmount.toLocaleString("en-US", {
                        style: "currency",
                        currency: "USD",
                      })}
                    </p>
                    <p className='text-xs text-[var(--color-text-secondary)]'>
                      {order.items.length}{" "}
                      {order.items.length === 1 ? "item" : "items"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Order Items */}
              <div className='p-6'>
                <div className='space-y-4'>
                  {order.items.map((item, index) => {
                    const product =
                      typeof item.product === "string"
                        ? ({ _id: item.product } as Product)
                        : (item.product as Product);
                    return (
                      <div
                        key={item._id || index}
                        className='flex items-center gap-4 p-3 rounded-lg border border-[var(--color-border)] hover:border-blue-500/30 hover:bg-blue-50/5 transition-all duration-200'
                      >
                        {product.images?.[0] && (
                          <div className='relative h-20 w-20 flex-shrink-0 bg-white rounded-md overflow-hidden border border-[var(--color-border)]'>
                            <Image
                              src={product.images[0]}
                              alt={product.name || "Product image"}
                              fill
                              className='object-contain p-2'
                            />
                          </div>
                        )}
                        <div className='flex-1 min-w-0'>
                          <h3 className='text-[var(--color-text-primary)] font-medium truncate'>
                            {product.name || `Product ID: ${product._id}`}
                          </h3>
                          <div className='mt-1 flex flex-wrap gap-4 text-sm text-[var(--color-text-secondary)]'>
                            <p className='flex items-center gap-1'>
                              <span>Price:</span>
                              <span className='font-medium text-[var(--color-text-primary)]'>
                                {item.price.toLocaleString("en-US", {
                                  style: "currency",
                                  currency: "USD",
                                })}
                              </span>
                            </p>
                            <p className='flex items-center gap-1'>
                              <span>Qty:</span>
                              <span className='font-medium text-[var(--color-text-primary)]'>
                                {item.quantity}
                              </span>
                            </p>
                            <p className='flex items-center gap-1'>
                              <span>Total:</span>
                              <span className='font-medium text-[var(--color-text-primary)]'>
                                {(item.quantity * item.price).toLocaleString(
                                  "en-US",
                                  {
                                    style: "currency",
                                    currency: "USD",
                                  }
                                )}
                              </span>
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Order Details */}
                <div className='mt-6 grid grid-cols-1 md:grid-cols-2 gap-6 text-sm'>
                  <div className='p-4 rounded-lg border border-[var(--color-border)] bg-[var(--color-background-secondary)]'>
                    <h4 className='font-medium text-[var(--color-text-primary)] mb-3 flex items-center'>
                      <FiMapPin className='mr-2 h-4 w-4' />
                      Shipping Address
                    </h4>
                    <div className='text-[var(--color-text-secondary)] space-y-1'>
                      <p className='font-medium text-[var(--color-text-primary)]'>
                        {order.shippingAddress.street}
                      </p>
                      <p>
                        {order.shippingAddress.city},{" "}
                        {order.shippingAddress.state}{" "}
                        {order.shippingAddress.zipCode}
                      </p>
                      <p>{order.shippingAddress.country}</p>
                    </div>
                  </div>
                  <div className='p-4 rounded-lg border border-[var(--color-border)] bg-[var(--color-background-secondary)]'>
                    <h4 className='font-medium text-[var(--color-text-primary)] mb-3 flex items-center'>
                      <FiTruck className='mr-2 h-4 w-4' />
                      Delivery Information
                    </h4>
                    <div className='text-[var(--color-text-secondary)] space-y-2'>
                      <p className='flex items-center justify-between'>
                        <span>Expected Delivery:</span>
                        <span className='font-medium text-[var(--color-text-primary)]'>
                          {new Date(
                            order.estimatedDeliveryDate
                          ).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </span>
                      </p>
                      {order.trackingNumber && (
                        <p className='flex items-center justify-between'>
                          <span>Tracking Number:</span>
                          <span className='font-medium text-[var(--color-text-primary)] bg-[var(--color-bg-primary)] px-2 py-1 rounded text-xs'>
                            {order.trackingNumber.toUpperCase()}
                          </span>
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className='text-center py-12'>
          <div className='text-[var(--color-text-secondary)] mb-4'>
            No orders found
          </div>
          <motion.button
            onClick={() => router.push("/store")}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className='btn-primary inline-flex items-center px-6 py-3'
          >
            <FiShoppingBag className='mr-2 h-5 w-5' />
            Start Shopping
          </motion.button>
        </div>
      )}
    </motion.div>
  );

  const renderSettings = () => (
    <motion.div
      className='space-y-6'
      initial={fadeIn.initial}
      animate={fadeIn.animate}
    >
      <div className='bg-[var(--color-bg-primary)] p-6 rounded-lg shadow-lg'>
        <h3 className='text-xl font-bold text-[var(--color-text-primary)] mb-6'>
          <FiLock className='inline-block mr-2' />
          Change Password
        </h3>
        <form onSubmit={handlePasswordChange} className='space-y-4'>
          <div>
            <label className='block text-sm font-medium text-gray-300'>
              Current Password
            </label>
            <input
              type='password'
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className='input-primary'
              required
            />
          </div>
          <div>
            <label className='block text-sm font-medium text-gray-300'>
              New Password
            </label>
            <input
              type='password'
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className='input-primary'
              required
            />
          </div>
          <div>
            <label className='block text-sm font-medium text-gray-300'>
              Confirm New Password
            </label>
            <input
              type='password'
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className='input-primary'
              required
            />
          </div>
          <motion.button
            type='submit'
            disabled={isSubmittingPassword}
            className='btn-primary'
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {isSubmittingPassword ? "Updating..." : "Change Password"}
          </motion.button>
        </form>
      </div>

      <div className='card-danger p-6'>
        <h3 className='text-xl font-bold text-[var(--color-danger)] mb-4'>
          <FiAlertTriangle className='inline-block mr-2' />
          Delete Account
        </h3>
        <p className='text-[var(--color-text-secondary)] mb-4'>
          This action cannot be undone. All your data will be permanently
          deleted.
        </p>
        {!isConfirmingDelete ? (
          <motion.button
            onClick={() => setIsConfirmingDelete(true)}
            className='btn-outline-danger flex items-center justify-center w-full'
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <FiTrash2 className='mr-2' />
            Delete Account
          </motion.button>
        ) : (
          <div className='space-y-4'>
            <p className='text-[var(--color-danger)] font-medium'>
              Are you absolutely sure?
            </p>
            <div className='flex space-x-4'>
              <motion.button
                onClick={handleDeleteAccount}
                className='btn-danger flex-1'
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Yes, delete my account
              </motion.button>
              <motion.button
                onClick={() => setIsConfirmingDelete(false)}
                className='btn-secondary flex-1'
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Cancel
              </motion.button>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );

  return (
    <ProtectedRoute>
      <div className='main-layout'>
        <div className='content-container'>
          <Tab.Group>
            <Tab.List className='flex space-x-1 rounded-xl bg-[var(--color-bg-primary)] p-1 mb-8'>
              {tabs.map((tab) => (
                <Tab
                  key={tab.name}
                  className={({ selected }) =>
                    classNames(
                      "nav-tab",
                      selected ? "nav-tab-active" : "nav-tab-inactive"
                    )
                  }
                >
                  <div className='flex items-center justify-center'>
                    {tab.icon}
                    <span className='ml-2'>{tab.name}</span>
                  </div>
                </Tab>
              ))}
            </Tab.List>

            <Tab.Panels>
              <Tab.Panel className='page-section'>
                {renderProfileForm()}
              </Tab.Panel>
              <Tab.Panel className='page-section'>
                <div className='space-y-6'>
                  {user?.role === "seller" && store ? (
                    <>
                      {renderStoreStatus()}
                      {store.status === "pending" ? (
                        <div className='text-center text-[var(--color-text-secondary)] mt-4'>
                          Your store is currently pending approval.
                        </div>
                      ) : (
                        store.status === "rejected" && (
                          <div className='text-center text-[var(--color-text-secondary)] mt-4'>
                            Your store has been rejected due to the following
                            reason:{" "}
                            {
                              // @ts-expect-error - store.rejectReason may be undefined but we handle this case
                              store.rejectReason
                            }
                            .
                          </div>
                        )
                      )}
                    </>
                  ) : (
                    <div>
                      <h2 className='text-2xl font-bold text-[var(--color-text-primary)] mb-4'>
                        Become a Seller
                      </h2>
                      <p className='text-[var(--color-text-secondary)] mb-6'>
                        Start selling your products on our platform. Fill out
                        the form below to get started.
                      </p>
                      {renderStoreForm()}
                    </div>
                  )}
                </div>
              </Tab.Panel>
              <Tab.Panel className='page-section'>{renderOrders()}</Tab.Panel>
              <Tab.Panel className='page-section'>{renderSettings()}</Tab.Panel>
            </Tab.Panels>
          </Tab.Group>
        </div>
      </div>
    </ProtectedRoute>
  );
}
