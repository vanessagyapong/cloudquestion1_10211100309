"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import { productsApi } from "@/services/api";
import { Product } from "@/types/product";
import { AxiosError } from "axios";
import {
  FiPlus,
  FiPackage,
  FiDollarSign,
  FiTrendingUp,
  FiEdit2,
  FiTrash2,
  FiAlertCircle,
} from "react-icons/fi";
import { toast } from "sonner";

const fadeIn = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
};

export default function SellerDashboard() {
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const fetchProducts = async () => {
      try {
        const response = await productsApi.getSellerProducts();
        if (isMounted) {
          setProducts(response.data.data);
        }
      } catch (error) {
        if (
          isMounted &&
          !(error instanceof AxiosError && error.message === "canceled")
        ) {
          console.error("Error fetching products:", error);
          toast.error("Failed to load products");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchProducts();

    return () => {
      isMounted = false;
    };
  }, []);

  const stats = [
    {
      name: "Total Products",
      icon: <FiPackage className='h-6 w-6' />,
      value: products.length.toString(),
      change: "+4.75%",
      changeType: "positive",
    },
    {
      name: "Total Revenue",
      icon: <FiDollarSign className='h-6 w-6' />,
      value: `$${products
        .reduce(
          (sum, product) => sum + product.price * (product.totalSales || 0),
          0
        )
        .toLocaleString("en-US", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}`,
      change: "+54.02%",
      changeType: "positive",
    },
    {
      name: "Total Sales",
      icon: <FiTrendingUp className='h-6 w-6' />,
      value: products
        .reduce((sum, product) => sum + (product.totalSales || 0), 0)
        .toString(),
      change: "-1.39%",
      changeType: "negative",
    },
    // {
    //   name: "Pending Orders",
    //   icon: <FiShoppingBag className='h-6 w-6' />,
    //   value: products
    //     .reduce((sum, product) => sum + (product.pendingOrders || 0), 0)
    //     .toString(),
    //   change: "+10.18%",
    //   changeType: "positive",
    // },
  ];

  const handleDeleteProduct = async (productId: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return;

    setIsDeleting(productId);
    try {
      await productsApi.deleteProduct(productId);
      setProducts((prev) => prev.filter((p) => p._id !== productId));
      toast.success("Product deleted successfully");
    } catch (error) {
      console.error("Error deleting product:", error);
      toast.error("Failed to delete product");
    } finally {
      setIsDeleting(null);
    }
  };

  if (!user || user.role !== "seller") {
    return (
      <div className='min-h-screen flex items-center justify-center'>
        <div className='text-center'>
          <FiAlertCircle className='mx-auto h-12 w-12 text-[var(--color-warning)]' />
          <h2 className='mt-4 text-2xl font-bold text-[var(--color-text-primary)]'>
            Access Denied
          </h2>
          <p className='mt-2 text-[var(--color-text-secondary)]'>
            You need to be a seller to access this page.
          </p>
          <Link href='/profile' className='btn-primary inline-block mt-4'>
            Go to Profile
          </Link>
        </div>
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <div className='main-layout'>
        <div className='content-container'>
          <div className='flex items-center justify-between mb-8'>
            <div>
              <h1 className='text-3xl font-bold text-[var(--color-text-primary)]'>
                Seller Dashboard
              </h1>
              <p className='mt-2 text-[var(--color-text-secondary)]'>
                Manage your products and view your store&apos;s performance
              </p>
            </div>
            <Link
              href='/seller/products/new'
              className='btn-primary flex items-center'
            >
              <FiPlus className='mr-2 h-5 w-5' />
              Add New Product
            </Link>
          </div>

          {/* Stats Grid */}
          <div className='grid grid-cols-1 gap-6 mb-8 sm:grid-cols-2 lg:grid-cols-4'>
            {stats.map((stat) => (
              <motion.div
                key={stat.name}
                className='card p-6'
                initial={fadeIn.initial}
                animate={fadeIn.animate}
                whileHover={{ scale: 1.02 }}
              >
                <div className='flex items-center justify-between'>
                  <div className='text-[var(--color-text-secondary)]'>
                    {stat.icon}
                  </div>
                  <div
                    className={`text-sm font-medium ${
                      stat.changeType === "positive"
                        ? "text-[var(--color-success)]"
                        : "text-[var(--color-error)]"
                    }`}
                  >
                    {stat.change}
                  </div>
                </div>
                <div className='mt-4'>
                  <h3 className='text-lg font-medium text-[var(--color-text-secondary)]'>
                    {stat.name}
                  </h3>
                  <p className='text-2xl font-bold text-[var(--color-text-primary)]'>
                    {stat.value}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Products List */}
          <div className='card'>
            <div className='p-6 border-b border-[var(--color-border-primary)]'>
              <h2 className='text-xl font-bold text-[var(--color-text-primary)]'>
                Your Products
              </h2>
            </div>
            <div className='p-6'>
              {loading ? (
                <div className='text-center py-12'>
                  <div className='animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[var(--color-primary)] mx-auto'></div>
                  <p className='mt-4 text-[var(--color-text-secondary)]'>
                    Loading products...
                  </p>
                </div>
              ) : products.length > 0 ? (
                <div className='grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3'>
                  {products.map((product) => (
                    <motion.div
                      key={product._id}
                      className='card overflow-hidden'
                      initial={fadeIn.initial}
                      animate={fadeIn.animate}
                      whileHover={{ scale: 1.02 }}
                    >
                      <div className='relative aspect-video'>
                        <Image
                          src={product.images[4]}
                          alt={product.name}
                          width={400}
                          height={225}
                          className='object-scale-down w-full h-full'
                          unoptimized
                        />
                      </div>
                      <div className='p-4'>
                        <h3 className='text-lg font-medium text-[var(--color-text-primary)] mb-2'>
                          {product.name}
                        </h3>
                        <p className='text-[var(--color-text-secondary)] text-sm mb-4 line-clamp-2'>
                          {product.description}
                        </p>
                        <div className='flex items-center justify-between'>
                          <span className='text-lg font-bold text-[var(--color-text-primary)]'>
                            $
                            {product.price.toLocaleString("en-US", {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}
                          </span>
                          <div className='flex space-x-2'>
                            <Link
                              href={`/seller/products/${product._id}`}
                              className='btn-secondary p-2'
                            >
                              <FiEdit2 className='h-4 w-4' />
                            </Link>
                            <button
                              onClick={() => handleDeleteProduct(product._id)}
                              disabled={isDeleting === product._id}
                              className='btn-outline-danger p-2'
                            >
                              <FiTrash2 className='h-4 w-4' />
                            </button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className='text-center flex flex-col py-5'>
                  <FiPackage className='mx-auto h-12 w-12 text-[var(--color-text-secondary)]' />
                  <h3 className='mt-4 text-lg font-medium text-[var(--color-text-primary)]'>
                    No products yet
                  </h3>
                  <p className='mt-2 text-[var(--color-text-secondary)]'>
                    Get started by adding your first product
                  </p>
                  <Link
                    href='/seller/products/new'
                    className='btn-primary mt-4'
                  >
                    Add Product
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
