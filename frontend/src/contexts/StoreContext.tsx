"use client";

import React, { createContext, useContext, useState } from "react";
import { Store, StoreStatus } from "@/types/store";
import { Product, CreateProductData } from "@/types/product";
import { storeApi } from "@/services/api";
import { toast } from "sonner";

interface StoreContextType {
  store: Store | null;
  products: Product[];
  loading: boolean;
  error: string | null;
  createStore: (data: { name: string; description: string }) => Promise<void>;
  updateStore: (data: { name?: string; description?: string }) => Promise<void>;
  refreshStore: () => Promise<void>;
  getStoreDetails: () => Promise<void>;
  getStoreProducts: () => Promise<void>;
  createProduct: (data: CreateProductData) => Promise<void>;
  updateProduct: (id: string, data: CreateProductData) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [store, setStore] = useState<Store | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createStore = async (data: { name: string; description: string }) => {
    try {
      setLoading(true);
      setError(null);
      const formData = new FormData();
      formData.append("name", data.name);
      formData.append("description", data.description);
      const response = await storeApi.createStore(formData);
      const storeData = response.data.data.store;
      const newStore: Store = {
        _id: storeData._id,
        name: storeData.name,
        description: storeData.description,
        owner: storeData.owner,
        logo: storeData.logo || undefined,
        rating: 0,
        totalRatings: 0,
        totalSales: 0,
        balance: 0,
        isActive: true,
        status: "pending" as StoreStatus,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setStore(newStore);
    } catch (err) {
      console.error("Error creating store:", err);
      setError("Failed to create store");
      toast.error("Failed to create store");
      throw err;
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
      const storeData = response.data.data.store;
      const updatedStore: Store = {
        _id: storeData._id,
        name: storeData.name,
        description: storeData.description,
        owner: storeData.owner,
        logo: storeData.logo || undefined,
        rating: storeData.rating || 0,
        totalRatings: storeData.totalRatings || 0,
        totalSales: storeData.totalSales || 0,
        balance: storeData.balance || 0,
        isActive: storeData.isActive || true,
        status: (storeData.status || "pending") as StoreStatus,
        createdAt: storeData.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setStore(updatedStore);
    } catch (err) {
      console.error("Error updating store:", err);
      setError("Failed to update store");
      toast.error("Failed to update store");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const refreshStore = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await storeApi.getMyStore();
      const storeData = response.data.data;
      const currentStore: Store = {
        _id: storeData._id,
        name: storeData.name,
        description: storeData.description,
        owner: storeData.owner,
        logo: storeData.logo || undefined,
        rating: storeData.rating || 0,
        totalRatings: storeData.totalRatings || 0,
        totalSales: storeData.totalSales || 0,
        balance: storeData.balance || 0,
        isActive: storeData.isActive || true,
        status: (storeData.status || "pending") as StoreStatus,
        createdAt: storeData.createdAt || new Date().toISOString(),
        updatedAt: storeData.updatedAt || new Date().toISOString(),
      };
      setStore(currentStore);
    } catch (err) {
      console.error("Error fetching store:", err);
      setError("Failed to fetch store");
      toast.error("Failed to fetch store");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getStoreDetails = async () => {
    await refreshStore();
  };

  const getStoreProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await storeApi.getStoreProducts();
      setProducts(response.data.data);
    } catch (err) {
      console.error("Error fetching products:", err);
      setError("Failed to fetch products");
      toast.error("Failed to fetch products");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const createProduct = async (data: CreateProductData) => {
    try {
      setLoading(true);
      setError(null);
      const response = await storeApi.createProduct(data);
      setProducts([...products, response.data.data]);
      toast.success("Product created successfully");
    } catch (err) {
      console.error("Error creating product:", err);
      setError("Failed to create product");
      toast.error("Failed to create product");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateProduct = async (id: string, data: CreateProductData) => {
    try {
      setLoading(true);
      setError(null);
      const response = await storeApi.updateProduct(id, data);
      setProducts(products.map((p) => (p._id === id ? response.data.data : p)));
      toast.success("Product updated successfully");
    } catch (err) {
      console.error("Error updating product:", err);
      setError("Failed to update product");
      toast.error("Failed to update product");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteProduct = async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      await storeApi.deleteProduct(id);
      setProducts(products.filter((p) => p._id !== id));
      toast.success("Product deleted successfully");
    } catch (err) {
      console.error("Error deleting product:", err);
      setError("Failed to delete product");
      toast.error("Failed to delete product");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return (
    <StoreContext.Provider
      value={{
        store,
        products,
        loading,
        error,
        createStore,
        updateStore,
        refreshStore,
        getStoreDetails,
        getStoreProducts,
        createProduct,
        updateProduct,
        deleteProduct,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const context = useContext(StoreContext);
  if (context === undefined) {
    throw new Error("useStore must be used within a StoreProvider");
  }
  return context;
}
