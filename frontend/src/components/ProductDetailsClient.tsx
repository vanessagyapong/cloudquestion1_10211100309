"use client";
import { useEffect, useState } from "react";
import { productsApi } from "@/services/api";
import { Product } from "@/types/product";
import ProductDetailsView from "./ProductDetailsView";
import { motion } from "framer-motion";
import { FiAlertCircle, FiLoader } from "react-icons/fi";

interface ProductDetailsClientProps {
  id: string;
}

export default function ProductDetailsClient({
  id,
}: ProductDetailsClientProps) {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await productsApi.getProduct(id);
        setProduct(response.data.data);
      } catch (err) {
        console.error("Error fetching product:", err);
        setError("Failed to load product details");
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  if (loading) {
    return (
      <div className='min-h-[400px] flex items-center justify-center'>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className='text-center'
        >
          <FiLoader className='h-8 w-8 animate-spin text-[var(--color-primary)] mx-auto mb-4' />
          <p className='text-[var(--color-text-secondary)]'>
            Loading product details...
          </p>
        </motion.div>
      </div>
    );
  }

  if (error) {
    return (
      <div className='min-h-[400px] flex items-center justify-center'>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className='text-center'
        >
          <div className='bg-[var(--color-bg-secondary)] p-6 rounded-lg shadow-lg border border-[var(--color-border-primary)]'>
            <FiAlertCircle className='h-12 w-12 text-[var(--color-error)] mx-auto mb-4' />
            <h3 className='text-lg font-semibold text-[var(--color-text-primary)] mb-2'>
              Oops! Something went wrong
            </h3>
            <p className='text-[var(--color-text-secondary)] mb-4'>{error}</p>
            <button
              onClick={() => window.location.reload()}
              className='btn-primary inline-flex items-center'
            >
              Try Again
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className='min-h-[400px] flex items-center justify-center'>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className='text-center'
        >
          <div className='bg-[var(--color-bg-secondary)] p-6 rounded-lg shadow-lg border border-[var(--color-border-primary)]'>
            <FiAlertCircle className='h-12 w-12 text-[var(--color-warning)] mx-auto mb-4' />
            <h3 className='text-lg font-semibold text-[var(--color-text-primary)] mb-2'>
              Product Not Found
            </h3>
            <p className='text-[var(--color-text-secondary)] mb-4'>
              The product you&apos;re looking for doesn&apos;t exist or has been
              removed.
            </p>
            <a href='/store' className='btn-primary inline-flex items-center'>
              Back to Store
            </a>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <ProductDetailsView product={product} />
    </motion.div>
  );
}
