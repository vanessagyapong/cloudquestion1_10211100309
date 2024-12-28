"use client";

import React, { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  FiArrowLeft,
  FiUpload,
  FiDollarSign,
  FiBox,
  FiTag,
  FiImage,
  FiAlertCircle,
} from "react-icons/fi";
import { productsApi } from "@/services/api";
import { toast } from "sonner";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useDropzone } from "react-dropzone";
import AnimatedInput from "@/components/AnimatedInput";
import { CreateProductData } from "@/types/product";

const categories = [
  "Electronics",
  "Clothing",
  "Books",
  "Home & Garden",
  "Sports",
] as const;

type Category = (typeof categories)[number];

const fadeIn = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
};

export default function NewProduct() {
  const { user } = useAuth();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState<Category>("Electronics");
  const [stockQuantity, setStockQuantity] = useState("");
  const [images, setImages] = useState<File[]>([]);
  const [errors, setErrors] = useState({
    name: "",
    description: "",
    price: "",
    stock: "",
    images: "",
  });

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length + images.length > 5) {
        toast.error("Maximum 5 images allowed");
        return;
      }
      setImages((prev) => [...prev, ...acceptedFiles]);
      setErrors((prev) => ({ ...prev, images: "" }));
    },
    [images]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".jpeg", ".jpg", ".png", ".webp"],
    },
    maxSize: 5242880, // 5MB
  });

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const validateForm = () => {
    const newErrors = {
      name: "",
      description: "",
      price: "",
      stock: "",
      images: "",
    };
    let isValid = true;

    if (!name.trim()) {
      newErrors.name = "Product name is required";
      isValid = false;
    }

    if (!description.trim()) {
      newErrors.description = "Product description is required";
      isValid = false;
    }

    if (!price || Number(price) <= 0) {
      newErrors.price = "Please enter a valid price";
      isValid = false;
    }

    if (!stockQuantity || Number(stockQuantity) < 0) {
      newErrors.stock = "Please enter a valid stock quantity";
      isValid = false;
    }

    if (images.length === 0) {
      newErrors.images = "At least one image is required";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      // Convert images to base64
      const base64Images = await Promise.all(
        images.map(async (image) => {
          return new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(image);
          });
        })
      );

      const productData: CreateProductData = {
        name: name,
        description: description,
        price: parseFloat(price),
        category: category,
        stock: parseInt(stockQuantity),
        images: base64Images,
      };

      await productsApi.createProduct(productData);
      toast.success("Product created successfully");
      router.push("/seller/dashboard");
    } catch (error) {
      console.error("Error creating product:", error);
      toast.error("Failed to create product");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user || user.role !== "seller") {
    return (
      <div className='min-h-screen flex items-center justify-center bg-[var(--color-bg-primary)]'>
        <motion.div
          className='text-center p-8 bg-[var(--color-bg-secondary)] rounded-lg shadow-lg border border-[var(--color-border-primary)]'
          {...fadeIn}
        >
          <FiAlertCircle className='h-12 w-12 text-[var(--color-warning)] mx-auto mb-4' />
          <h2 className='text-2xl font-bold text-[var(--color-text-primary)] mb-4'>
            Access Denied
          </h2>
          <p className='text-[var(--color-text-secondary)] mb-6'>
            You need to be a seller to access this page.
          </p>
          <Link
            href='/profile'
            className='btn-primary inline-flex items-center'
          >
            Go to Profile
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <div className='min-h-screen py-12 pt-24 bg-[var(--color-bg-primary)]'>
        <div className='max-w-4xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='mb-8'>
            <Link
              href='/seller/dashboard'
              className='inline-flex items-center text-[var(--color-text-secondary)] hover:text-[var(--color-primary)] transition-colors duration-200'
            >
              <FiArrowLeft className='mr-2' />
              Back to Dashboard
            </Link>
          </div>

          <motion.div
            className='bg-[var(--color-bg-secondary)] rounded-xl shadow-lg p-6 md:p-8 border border-[var(--color-border-primary)]'
            {...fadeIn}
          >
            <h1 className='text-2xl font-bold text-[var(--color-text-primary)] mb-6'>
              Add New Product
            </h1>

            <form onSubmit={handleSubmit} className='space-y-6'>
              <AnimatedInput
                label='Product Name'
                name='name'
                value={name}
                onChange={(e) => setName(e.target.value)}
                type='text'
                placeholder='Enter product name'
                error={errors.name}
                required
              />

              <div>
                <label className='block text-sm font-medium mb-1.5 text-[var(--color-text-secondary)]'>
                  Description{" "}
                  <span className='text-[var(--color-error)]'>*</span>
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                  rows={4}
                  className={`block w-full px-4 py-2.5 bg-[var(--color-bg-primary)] border rounded-lg shadow-sm 
                    text-[var(--color-text-primary)] placeholder-[var(--color-text-tertiary)]
                    focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent
                    disabled:opacity-50 disabled:cursor-not-allowed
                    transition-all duration-200 ${
                      errors.description
                        ? "border-[var(--color-error)]"
                        : "border-[var(--color-border-primary)]"
                    }`}
                  placeholder='Enter product description'
                />
                {errors.description && (
                  <p className='mt-1 text-sm text-[var(--color-error)]'>
                    {errors.description}
                  </p>
                )}
              </div>

              <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                <div>
                  <label className='block text-sm font-medium mb-1.5 text-[var(--color-text-secondary)]'>
                    Price <span className='text-[var(--color-error)]'>*</span>
                  </label>
                  <div className='relative'>
                    <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                      <FiDollarSign className='text-[var(--color-text-tertiary)]' />
                    </div>
                    <input
                      type='number'
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      required
                      min='0'
                      step='0.01'
                      className={`block w-full pl-10 pr-4 py-2.5 bg-[var(--color-bg-primary)] border rounded-lg shadow-sm 
                        text-[var(--color-text-primary)] placeholder-[var(--color-text-tertiary)]
                        focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent
                        disabled:opacity-50 disabled:cursor-not-allowed
                        transition-all duration-200 ${
                          errors.price
                            ? "border-[var(--color-error)]"
                            : "border-[var(--color-border-primary)]"
                        }`}
                      placeholder='0.00'
                    />
                    {errors.price && (
                      <p className='mt-1 text-sm text-[var(--color-error)]'>
                        {errors.price}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <label className='block text-sm font-medium mb-1.5 text-[var(--color-text-secondary)]'>
                    Category{" "}
                    <span className='text-[var(--color-error)]'>*</span>
                  </label>
                  <div className='relative'>
                    <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                      <FiTag className='text-[var(--color-text-tertiary)]' />
                    </div>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value as Category)}
                      required
                      className='block w-full pl-10 pr-4 py-2.5 bg-[var(--color-bg-primary)] border border-[var(--color-border-primary)] rounded-lg shadow-sm 
                        text-[var(--color-text-primary)]
                        focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent
                        disabled:opacity-50 disabled:cursor-not-allowed
                        transition-all duration-200'
                    >
                      {categories.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className='block text-sm font-medium mb-1.5 text-[var(--color-text-secondary)]'>
                    Stock Quantity{" "}
                    <span className='text-[var(--color-error)]'>*</span>
                  </label>
                  <div className='relative'>
                    <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                      <FiBox className='text-[var(--color-text-tertiary)]' />
                    </div>
                    <input
                      type='number'
                      value={stockQuantity}
                      onChange={(e) => setStockQuantity(e.target.value)}
                      required
                      min='0'
                      className={`block w-full pl-10 pr-4 py-2.5 bg-[var(--color-bg-primary)] border rounded-lg shadow-sm 
                        text-[var(--color-text-primary)] placeholder-[var(--color-text-tertiary)]
                        focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent
                        disabled:opacity-50 disabled:cursor-not-allowed
                        transition-all duration-200 ${
                          errors.stock
                            ? "border-[var(--color-error)]"
                            : "border-[var(--color-border-primary)]"
                        }`}
                      placeholder='Enter stock quantity'
                    />
                    {errors.stock && (
                      <p className='mt-1 text-sm text-[var(--color-error)]'>
                        {errors.stock}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <label className='block text-sm font-medium mb-1.5 text-[var(--color-text-secondary)]'>
                  Product Images{" "}
                  <span className='text-[var(--color-error)]'>*</span>
                  <span className='text-[var(--color-text-tertiary)] ml-2'>
                    (Max 5 images, 5MB each)
                  </span>
                </label>
                <div
                  {...getRootProps()}
                  className={`mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded-lg
                    transition-colors duration-200 cursor-pointer
                    ${
                      isDragActive
                        ? "border-[var(--color-primary)] bg-[var(--color-primary)]/10"
                        : errors.images
                        ? "border-[var(--color-error)] bg-[var(--color-error)]/10"
                        : "border-[var(--color-border-primary)] hover:border-[var(--color-primary)]"
                    }`}
                >
                  <div className='space-y-1 text-center'>
                    <FiImage className='mx-auto h-12 w-12 text-[var(--color-text-tertiary)]' />
                    <div className='flex text-sm text-[var(--color-text-secondary)]'>
                      <label className='relative cursor-pointer rounded-md font-medium text-[var(--color-primary)] focus-within:outline-none'>
                        <span>Upload files</span>
                        <input {...getInputProps()} />
                      </label>
                      <p className='pl-1'>or drag and drop</p>
                    </div>
                    <p className='text-xs text-[var(--color-text-tertiary)]'>
                      PNG, JPG, WEBP up to 5MB
                    </p>
                  </div>
                </div>
                {errors.images && (
                  <p className='mt-1 text-sm text-[var(--color-error)]'>
                    {errors.images}
                  </p>
                )}

                {images.length > 0 && (
                  <div className='mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4'>
                    {images.map((file, index) => (
                      <div key={index} className='relative group'>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={URL.createObjectURL(file)}
                          alt={`Preview ${index + 1}`}
                          className='h-24 w-24 object-scale-down rounded-lg'
                        />
                        <button
                          type='button'
                          onClick={() => removeImage(index)}
                          className='absolute top-1 right-1 p-1 rounded-full bg-[var(--color-error)] text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200'
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <motion.button
                type='submit'
                className='w-full btn-primary flex items-center justify-center'
                disabled={isSubmitting}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {isSubmitting ? (
                  <>
                    <FiUpload className='animate-spin -ml-1 mr-3 h-5 w-5' />
                    Creating Product...
                  </>
                ) : (
                  <>
                    <FiUpload className='mr-2' />
                    Create Product
                  </>
                )}
              </motion.button>
            </form>
          </motion.div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
