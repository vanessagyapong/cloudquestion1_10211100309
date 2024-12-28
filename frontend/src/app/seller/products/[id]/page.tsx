"use client";

import React, { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { productsApi } from "@/services/api";
import { UpdateProductData } from "@/types/product";
import { toast } from "sonner";
import { FiLoader, FiUpload, FiX } from "react-icons/fi";
import ProtectedRoute from "@/components/ProtectedRoute";
import Image from "next/image";
import { useDropzone } from "react-dropzone";

interface EditProductPageProps {
  params: Promise<{ id: string }>;
}

const categories = [
  "Electronics",
  "Clothing",
  "Books",
  "Home & Garden",
  "Sports",
  "Beauty",
  "Toys",
  "Automotive",
  "Health",
  "Food & Beverages",
  "Others",
];

export default function EditProduct({ params }: EditProductPageProps) {
  const { id } = use(params);
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [category, setCategory] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [newImages, setNewImages] = useState<File[]>([]);
  const [previewImages, setPreviewImages] = useState<string[]>([]);

  const onDrop = React.useCallback((acceptedFiles: File[]) => {
    setNewImages((prev) => [...prev, ...acceptedFiles]);

    // Create preview URLs for the new images
    const newPreviews = acceptedFiles.map((file) => URL.createObjectURL(file));
    setPreviewImages((prev) => [...prev, ...newPreviews]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".jpeg", ".jpg", ".png", ".webp"],
    },
    multiple: true,
  });

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await productsApi.getProduct(id);
        const product = response.data.data;
        setName(product.name);
        setDescription(product.description);
        setPrice(product.price.toString());
        setStock(product.stock.toString());
        setCategory(product.category);
        setImages(product.images);
        setPreviewImages(product.images);
      } catch (error) {
        console.error("Error fetching product:", error);
        toast.error("Failed to load product");
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();

    // Cleanup function to revoke preview URLs
    return () => {
      previewImages.forEach((url) => {
        if (url.startsWith("blob:")) {
          URL.revokeObjectURL(url);
        }
      });
    };
  }, [id]);

  const convertToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      // Convert new images to base64
      const base64Images = await Promise.all(newImages.map(convertToBase64));

      // Combine existing images with new base64 images
      const allImages = [...images, ...base64Images];

      const productData: UpdateProductData = {
        name,
        description,
        price: parseFloat(price),
        stock: parseInt(stock),
        category,
        images: allImages,
      };

      await productsApi.updateProduct(id, productData);
      toast.success("Product updated successfully");
      router.push("/seller/dashboard");
    } catch (error) {
      console.error("Error updating product:", error);
      toast.error("Failed to update product");
    } finally {
      setSubmitting(false);
    }
  };

  const removeImage = (index: number) => {
    const isNewImage = index >= images.length;
    if (isNewImage) {
      const newImageIndex = index - images.length;
      setNewImages((prev) => prev.filter((_, i) => i !== newImageIndex));
      setPreviewImages((prev) => prev.filter((_, i) => i !== index));
    } else {
      setImages((prev) => prev.filter((_, i) => i !== index));
      setPreviewImages((prev) => prev.filter((_, i) => i !== index));
    }
  };

  if (loading) {
    return (
      <div className='min-h-screen flex items-center justify-center'>
        <FiLoader className='h-8 w-8 animate-spin text-[var(--color-primary)]' />
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <div className='min-h-screen py-12 bg-[var(--color-background-secondary)]'>
        <div className='max-w-4xl mx-auto px-4'>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className='bg-white rounded-lg shadow-sm p-6'
          >
            <h1 className='text-3xl font-bold text-[var(--color-text-primary)] mb-8'>
              Edit Product
            </h1>
            <form onSubmit={handleSubmit} className='space-y-6'>
              <div>
                <label
                  htmlFor='name'
                  className='block text-sm font-medium text-[var(--color-text-primary)]'
                >
                  Product Name
                </label>
                <input
                  type='text'
                  id='name'
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className='mt-1 block w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-background-secondary)] px-4 py-2 text-[var(--color-text-primary)] focus:border-[var(--color-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)]'
                  placeholder='Enter product name'
                />
              </div>
              <div>
                <label
                  htmlFor='description'
                  className='block text-sm font-medium text-[var(--color-text-primary)]'
                >
                  Description
                </label>
                <textarea
                  id='description'
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                  rows={4}
                  className='mt-1 block w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-background-secondary)] px-4 py-2 text-[var(--color-text-primary)] focus:border-[var(--color-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)]'
                  placeholder='Describe your product'
                />
              </div>
              <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
                <div>
                  <label
                    htmlFor='price'
                    className='block text-sm font-medium text-[var(--color-text-primary)]'
                  >
                    Price
                  </label>
                  <div className='relative'>
                    <span className='absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-secondary)]'>
                      $
                    </span>
                    <input
                      type='number'
                      id='price'
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      required
                      min='0'
                      step='0.01'
                      className='mt-1 block w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-background-secondary)] pl-8 pr-4 py-2 text-[var(--color-text-primary)] focus:border-[var(--color-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)]'
                      placeholder='0.00'
                    />
                  </div>
                </div>
                <div>
                  <label
                    htmlFor='stock'
                    className='block text-sm font-medium text-[var(--color-text-primary)]'
                  >
                    Stock
                  </label>
                  <input
                    type='number'
                    id='stock'
                    value={stock}
                    onChange={(e) => setStock(e.target.value)}
                    required
                    min='0'
                    className='mt-1 block w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-background-secondary)] px-4 py-2 text-[var(--color-text-primary)] focus:border-[var(--color-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)]'
                    placeholder='Available quantity'
                  />
                </div>
              </div>
              <div>
                <label
                  htmlFor='category'
                  className='block text-sm font-medium text-[var(--color-text-primary)]'
                >
                  Category
                </label>
                <select
                  id='category'
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  required
                  className='mt-1 block w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-background-secondary)] px-4 py-2 text-[var(--color-text-primary)] focus:border-[var(--color-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)]'
                >
                  <option value=''>Select a category</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              {/* Dropzone */}
              <div>
                <label className='block text-sm font-medium text-[var(--color-text-primary)] mb-2'>
                  Product Images
                </label>
                <div
                  {...getRootProps()}
                  className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                    isDragActive
                      ? "border-[var(--color-primary)] bg-[var(--color-primary)]/5"
                      : "border-[var(--color-border)] hover:border-[var(--color-primary)] hover:bg-[var(--color-primary)]/5"
                  }`}
                >
                  <input {...getInputProps()} />
                  <FiUpload className='mx-auto h-12 w-12 text-[var(--color-text-secondary)]' />
                  <p className='mt-2 text-sm text-[var(--color-text-secondary)]'>
                    {isDragActive
                      ? "Drop the files here..."
                      : "Drag & drop images here, or click to select"}
                  </p>
                  <p className='text-xs text-[var(--color-text-secondary)] mt-1'>
                    Supported formats: JPEG, PNG, WebP
                  </p>
                </div>
              </div>

              {/* Image Previews */}
              {previewImages.length > 0 && (
                <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
                  {previewImages.map((image, index) => (
                    <div key={index} className='relative group aspect-square'>
                      <Image
                        src={image}
                        alt={`Product image ${index + 1}`}
                        fill
                        className='rounded-lg object-cover'
                      />
                      <button
                        type='button'
                        onClick={() => removeImage(index)}
                        className='absolute top-2 right-2 p-1 rounded-full bg-red-500 text-white opacity-0 group-hover:opacity-100 transition-opacity'
                        aria-label='Remove image'
                      >
                        <FiX size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className='flex justify-end space-x-4 pt-4'>
                <motion.button
                  type='button'
                  onClick={() => router.back()}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className='px-6 py-2 rounded-lg text-[var(--color-text-primary)] bg-[var(--color-background-secondary)] hover:bg-[var(--color-background-hover)] border border-[var(--color-border)] transition-colors'
                >
                  Cancel
                </motion.button>
                <motion.button
                  type='submit'
                  disabled={submitting}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className='px-6 py-2 rounded-lg text-white bg-[var(--color-primary)] hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed'
                >
                  {submitting ? (
                    <span className='flex items-center gap-2'>
                      <FiLoader className='animate-spin' />
                      Updating...
                    </span>
                  ) : (
                    "Update Product"
                  )}
                </motion.button>
              </div>
            </form>
          </motion.div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
