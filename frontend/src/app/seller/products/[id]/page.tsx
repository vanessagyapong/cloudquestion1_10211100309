"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { productsApi } from "@/services/api";
import { UpdateProductData } from "@/types/product";
import { toast } from "sonner";
import { FiLoader } from "react-icons/fi";
import ProtectedRoute from "@/components/ProtectedRoute";

export default function EditProduct({ params }: { params: { id: string } }) {
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

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await productsApi.getProduct(params.id);
        const product = response.data.data;
        setName(product.name);
        setDescription(product.description);
        setPrice(product.price.toString());
        setStock(product.stock.toString());
        setCategory(product.category);
        setImages(product.images);
      } catch (error) {
        console.error("Error fetching product:", error);
        toast.error("Failed to load product");
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [params.id]);

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

      await productsApi.updateProduct(params.id, productData);
      toast.success("Product updated successfully");
      router.push("/seller/dashboard");
    } catch (error) {
      console.error("Error updating product:", error);
      toast.error("Failed to update product");
    } finally {
      setSubmitting(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setNewImages((prev) => [...prev, ...files]);
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
      <div className='min-h-screen py-12'>
        <div className='max-w-4xl mx-auto px-4'>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
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
                  <input
                    type='number'
                    id='price'
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    required
                    min='0'
                    step='0.01'
                    className='mt-1 block w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-background-secondary)] px-4 py-2 text-[var(--color-text-primary)] focus:border-[var(--color-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)]'
                  />
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
                  <option value='Electronics'>Electronics</option>
                  <option value='Clothing'>Clothing</option>
                  <option value='Books'>Books</option>
                  <option value='Home & Garden'>Home & Garden</option>
                  <option value='Sports'>Sports</option>
                </select>
              </div>
              <div>
                <label
                  htmlFor='images'
                  className='block text-sm font-medium text-[var(--color-text-primary)]'
                >
                  Add More Images
                </label>
                <input
                  type='file'
                  id='images'
                  onChange={handleImageChange}
                  multiple
                  accept='image/*'
                  className='mt-1 block w-full text-sm text-[var(--color-text-primary)]'
                />
              </div>
              <div className='flex justify-end space-x-4'>
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
                  {submitting ? "Updating..." : "Update Product"}
                </motion.button>
              </div>
            </form>
          </motion.div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
