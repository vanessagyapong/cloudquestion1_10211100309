"use client";

import React, { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { userApi } from "@/services/api";
import { toast } from "sonner";
import { motion } from "framer-motion";

interface BecomeSellerFormData {
  name: string;
  description: string;
  contactPhone: string;
  contactEmail: string;
  address: string;
}

export default function BecomeSeller() {
  const { user, refreshUser } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<BecomeSellerFormData>({
    name: "",
    description: "",
    contactPhone: "",
    contactEmail: user?.email || "",
    address: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error("You must be logged in to become a seller");
      return;
    }

    setIsSubmitting(true);
    try {
      await userApi.becomeSeller({
        name: formData.name,
        description: formData.description,
        contactPhone: formData.contactPhone,
        address: formData.address,
      });
      toast.success("Store creation request submitted successfully!");
      await refreshUser();
    } catch (error) {
      console.error("Error becoming seller:", error);
      toast.error("Failed to submit store creation request");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className='bg-neutral-800 p-6 rounded-lg shadow-lg'
    >
      <h2 className='text-2xl font-bold text-white mb-6'>Become a Seller</h2>
      <form onSubmit={handleSubmit} className='space-y-6'>
        <div>
          <label
            htmlFor='storeName'
            className='block text-sm font-medium text-gray-300'
          >
            Store Name
          </label>
          <input
            type='text'
            id='storeName'
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className='mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500'
            required
          />
        </div>

        <div>
          <label
            htmlFor='storeDescription'
            className='block text-sm font-medium text-gray-300'
          >
            Store Description
          </label>
          <textarea
            id='storeDescription'
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
            rows={3}
            className='mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500'
            required
          />
        </div>

        <div>
          <label
            htmlFor='contactPhone'
            className='block text-sm font-medium text-gray-300'
          >
            Contact Phone
          </label>
          <input
            type='tel'
            id='contactPhone'
            value={formData.contactPhone}
            onChange={(e) =>
              setFormData({ ...formData, contactPhone: e.target.value })
            }
            className='mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500'
            required
          />
        </div>

        <div>
          <label
            htmlFor='address'
            className='block text-sm font-medium text-gray-300'
          >
            Store Address
          </label>
          <textarea
            id='address'
            value={formData.address}
            onChange={(e) =>
              setFormData({ ...formData, address: e.target.value })
            }
            rows={2}
            className='mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500'
            required
          />
        </div>

        <motion.button
          type='submit'
          disabled={isSubmitting}
          className='w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-black
bg-white hover:opacity-75 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-gray-600 disabled:cursor-not-allowed'
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          {isSubmitting ? "Submitting..." : "Submit Application"}
        </motion.button>
      </form>
    </motion.div>
  );
}
