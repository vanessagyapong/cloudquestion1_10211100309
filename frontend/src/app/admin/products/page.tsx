"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { Product } from "@/types/product";
import { toast } from "sonner";
import { productsApi } from "@/services/api";

const ProductFormModal = dynamic(
  () => import("@/components/ProductFormModal"),
  {
    ssr: false,
  }
);

interface ApiProduct extends Omit<Product, "images"> {
  image: string;
}

export default function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showModal, setShowModal] = useState(false);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await productsApi.getProducts();
      const apiProducts = response.data.data as unknown as ApiProduct[];
      setProducts(
        apiProducts.map((product) => ({
          ...product,
          images: product.image ? [product.image] : [],
        }))
      );
    } catch (error) {
      console.error("Error fetching products:", error);
      toast.error("Failed to fetch products");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleDelete = async (productId: string) => {
    try {
      await productsApi.deleteProduct(productId);
      setProducts((current) => current.filter((p) => p._id !== productId));
      toast.success("Product deleted successfully");
    } catch (error) {
      console.error("Error deleting product:", error);
      toast.error("Failed to delete product");
    }
  };

  if (loading) {
    return (
      <div className='min-h-screen bg-[var(--color-background-secondary)] flex items-center justify-center'>
        <div className='h-12 w-12 border-4 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin'></div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-[var(--color-background-secondary)] py-8'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
        <div className='flex justify-between items-center mb-6'>
          <h1 className='text-2xl font-bold text-[var(--color-text-primary)]'>
            Product Management
          </h1>
          <button
            onClick={() => {
              setSelectedProduct(null);
              setShowModal(true);
            }}
            className='btn-primary px-4 py-2'
          >
            Add New Product
          </button>
        </div>

        <div className='bg-white rounded-lg shadow-sm overflow-hidden'>
          <table className='min-w-full divide-y divide-[var(--color-border)]'>
            <thead className='bg-[var(--color-background-secondary)]'>
              <tr>
                <th className='px-6 py-3 text-left text-xs font-medium text-[var(--color-text-secondary)] uppercase tracking-wider'>
                  Name
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium text-[var(--color-text-secondary)] uppercase tracking-wider'>
                  Category
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium text-[var(--color-text-secondary)] uppercase tracking-wider'>
                  Price
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium text-[var(--color-text-secondary)] uppercase tracking-wider'>
                  Stock
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium text-[var(--color-text-secondary)] uppercase tracking-wider'>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className='bg-white divide-y divide-[var(--color-border)]'>
              {products.map((product) => (
                <tr key={product._id}>
                  <td className='px-6 py-4 whitespace-nowrap'>
                    <div className='text-sm text-[var(--color-text-primary)]'>
                      {product.name}
                    </div>
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap'>
                    <div className='text-sm text-[var(--color-text-primary)]'>
                      {product.category}
                    </div>
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap'>
                    <div className='text-sm text-[var(--color-text-primary)]'>
                      ${product.price.toFixed(2)}
                    </div>
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap'>
                    <div className='text-sm text-[var(--color-text-primary)]'>
                      {product.stock}
                    </div>
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap text-sm font-medium'>
                    <button
                      onClick={() => {
                        setSelectedProduct(product);
                        setShowModal(true);
                      }}
                      className='text-[var(--color-primary)] hover:text-[var(--color-primary-dark)] mr-4'
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(product._id)}
                      className='text-[var(--color-error)] hover:text-[var(--color-error-dark)]'
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <ProductFormModal
          product={selectedProduct}
          onClose={() => setShowModal(false)}
          onSave={(product: Product) => {
            if (selectedProduct) {
              setProducts((current) =>
                current.map((p) => (p._id === product._id ? product : p))
              );
            } else {
              setProducts((current) => [...current, product]);
            }
            setShowModal(false);
          }}
        />
      )}
    </div>
  );
}
