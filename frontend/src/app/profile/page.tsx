/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import ProtectedRoute from "../../components/ProtectedRoute";
import { toast } from "sonner";
import { userApi, storeApi } from "@/services/api";
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
} from "react-icons/fi";
import { motion } from "framer-motion";
import { Store, StoreCreationData } from "@/types/user";
import Image from "next/image";
import { useCart } from "@/contexts/CartContext";

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
          setStore(res.data.data as unknown as Store);
        }
      }
    };

    if (user?.role === "seller") {
      fetchMyStore();
    }
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
    <motion.form
      onSubmit={handleSellerSubmit}
      className='card p-6'
      initial={fadeIn.initial}
      animate={fadeIn.animate}
      exit={fadeIn.exit}
    >
      <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
        <div>
          <label className='block text-sm font-medium text-gray-300'>
            <FiShoppingBag className='inline-block mr-2' />
            Store Name <span className='text-red-500'>*</span>
          </label>
          <input
            type='text'
            value={storeFormData.name}
            onChange={(e) =>
              setStoreFormData({ ...storeFormData, name: e.target.value })
            }
            className='input-primary'
            required
          />
        </div>

        <div>
          <label className='block text-sm font-medium text-gray-300'>
            <FiPhone className='inline-block mr-2' />
            Contact Phone
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
            className='input-primary'
            required
          />
        </div>
      </div>

      <div>
        <label className='block text-sm font-medium text-gray-300'>
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
          rows={3}
          className='input-primary'
          required
        />
      </div>

      <div>
        <label className='block text-sm font-medium text-gray-300'>
          <FiMapPin className='inline-block mr-2' />
          Store Address
        </label>
        <textarea
          value={storeFormData.address}
          onChange={(e) =>
            setStoreFormData({ ...storeFormData, address: e.target.value })
          }
          rows={2}
          className='input-primary'
          required
        />
      </div>

      <motion.button
        type='submit'
        disabled={isSubmittingSeller}
        className='btn-primary'
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <FiEdit className='mr-2' />
        {isSubmittingSeller ? "Submitting..." : "Submit Application"}
      </motion.button>
    </motion.form>
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
      {cartItems.length > 0 ? (
        <div className='space-y-4'>
          {cartItems.map((item) => (
            <div
              key={item.product._id}
              className='flex items-center space-x-4 p-4 rounded-lg'
            >
              <div className='relative h-20 w-20'>
                <Image
                  src={item.product.images[0]}
                  alt={item.product.name}
                  fill
                  className='object-scale-down rounded-md'
                />
              </div>
              <div className='flex-1'>
                <h3 className='text-[var(--color-text-primary)] font-medium'>
                  {item.product.name}
                </h3>
                <p className='text-[var(--color-text-secondary)]'>
                  Quantity: {item.quantity}
                </p>
                <p className='text-[var(--color-text-secondary)]'>
                  Total: ${(item.quantity * item.product.price).toFixed(2)}
                </p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className='text-center text-[var(--color-text-secondary)] py-8'>
          No orders found. Start shopping!
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
