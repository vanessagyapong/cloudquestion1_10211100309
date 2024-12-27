import React, { createContext, useContext, useState } from "react";
import { AxiosError } from "axios";
import { Store } from "@/types/user";
import { storeApi, productsApi } from "@/services/api";
import { ApiResponse } from "@/types/user";
import { Product, CreateProductData } from "@/types/product";

interface StoreContextType {
  store: Store | null;
  products: Product[];
  loading: boolean;
  error: string | null;
  createStore: (data: { name: string; description: string }) => Promise<void>;
  updateStore: (data: { name?: string; description?: string }) => Promise<void>;
  getStoreDetails: () => Promise<void>;
  createProduct: (data: CreateProductData) => Promise<void>;
  updateProduct: (productId: string, data: Partial<Product>) => Promise<void>;
  deleteProduct: (productId: string) => Promise<void>;
  getStoreProducts: () => Promise<void>;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const StoreProvider = ({ children }: { children: React.ReactNode }) => {
  const [store, setStore] = useState<Store | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleError = (err: unknown) => {
    const error = err as AxiosError<{ message: string }>;
    const message = error.response?.data?.message || "An error occurred";
    setError(message);
    throw error;
  };

  const createStore = async (data: { name: string; description: string }) => {
    try {
      setLoading(true);
      setError(null);
      const formData = new FormData();
      formData.append("name", data.name);
      formData.append("description", data.description);
      const response = await storeApi.createStore(formData);
      const apiResponse = response.data as ApiResponse<{ store: Store }>;
      setStore(apiResponse.data.store);
    } catch (err) {
      handleError(err);
    } finally {
      setLoading(false);
    }
  };

  const updateStore = async (data: { name?: string; description?: string }) => {
    try {
      setLoading(true);
      setError(null);
      const formData = new FormData();
      if (data.name) formData.append("name", data.name);
      if (data.description) formData.append("description", data.description);
      const response = await storeApi.updateStore(formData);
      const apiResponse = response.data as ApiResponse<{ store: Store }>;
      setStore(apiResponse.data.store);
    } catch (err) {
      handleError(err);
    } finally {
      setLoading(false);
    }
  };

  const getStoreDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await storeApi.getStore();
      const apiResponse = response.data as ApiResponse<{ store: Store }>;
      setStore(apiResponse.data.store);
    } catch (err) {
      handleError(err);
    } finally {
      setLoading(false);
    }
  };

  const createProduct = async (data: CreateProductData) => {
    try {
      setLoading(true);
      setError(null);
      const formData = new FormData();
      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined) {
          if (Array.isArray(value)) {
            value.forEach((v) => formData.append(key, v));
          } else {
            formData.append(key, value.toString());
          }
        }
      });
      const response = await productsApi.createProduct(formData);
      const apiResponse = response.data as ApiResponse<{ product: Product }>;
      setProducts((prev) => [...prev, apiResponse.data.product]);
    } catch (err) {
      handleError(err);
    } finally {
      setLoading(false);
    }
  };

  const updateProduct = async (productId: string, data: Partial<Product>) => {
    try {
      setLoading(true);
      setError(null);
      const formData = new FormData();
      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined) {
          if (Array.isArray(value)) {
            value.forEach((v) => {
              if (typeof v === "string" || v instanceof Blob) {
                formData.append(key, v);
              } else {
                formData.append(key, JSON.stringify(v));
              }
            });
          } else {
            if (typeof value === "string" || value instanceof Blob) {
              formData.append(key, value);
            } else {
              formData.append(key, JSON.stringify(value));
            }
          }
        }
      });
      const response = await productsApi.updateProduct(productId, formData);
      const apiResponse = response.data as ApiResponse<{ product: Product }>;
      setProducts((prev) =>
        prev.map((p) => (p._id === productId ? apiResponse.data.product : p))
      );
    } catch (err) {
      handleError(err);
    } finally {
      setLoading(false);
    }
  };

  const deleteProduct = async (productId: string) => {
    try {
      setLoading(true);
      setError(null);
      await productsApi.deleteProduct(productId);
      setProducts((prev) => prev.filter((p) => p._id !== productId));
    } catch (err) {
      handleError(err);
    } finally {
      setLoading(false);
    }
  };

  const getStoreProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await storeApi.getStoreProducts();
      const apiResponse = response.data as ApiResponse<{ products: Product[] }>;
      setProducts(apiResponse.data.products);
    } catch (err) {
      handleError(err);
    } finally {
      setLoading(false);
    }
  };

  const value = {
    store,
    products,
    loading,
    error,
    createStore,
    updateStore,
    getStoreDetails,
    createProduct,
    updateProduct,
    deleteProduct,
    getStoreProducts,
  };

  return (
    <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (context === undefined) {
    throw new Error("useStore must be used within a StoreProvider");
  }
  return context;
};
