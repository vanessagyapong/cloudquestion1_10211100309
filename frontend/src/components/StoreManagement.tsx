"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { useStore } from "@/contexts/StoreContext";
import { useAuth } from "@/contexts/AuthContext";
import { Product, ProductFormData, CreateProductData } from "@/types/product";

const StoreManagement = () => {
  const { user } = useAuth();
  const {
    store,
    products,
    loading,
    error,
    getStoreDetails,
    getStoreProducts,
    createProduct,
    updateProduct,
    deleteProduct,
  } = useStore();

  const [showProductForm, setShowProductForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<string | null>(null);
  const [productFormData, setProductFormData] = useState<ProductFormData>({
    name: "",
    description: "",
    price: 0,
    stock: 0,
    category: "",
    images: [],
  });

  useEffect(() => {
    const fetchData = async () => {
      await getStoreDetails();
      await getStoreProducts();
    };
    fetchData();
  }, [getStoreDetails, getStoreProducts]);

  const handleProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingProduct) {
        await updateProduct(editingProduct, {
          ...productFormData,
          stock: productFormData.stock,
          images: productFormData.images,
        });
      } else {
        const createProductData: CreateProductData = {
          name: productFormData.name,
          description: productFormData.description,
          price: productFormData.price,
          category: productFormData.category,
          stock: productFormData.stock,
          images: productFormData.images,
        };
        await createProduct(createProductData);
      }
      setShowProductForm(false);
      setEditingProduct(null);
      setProductFormData({
        name: "",
        description: "",
        price: 0,
        stock: 0,
        category: "",
        images: [],
      });
    } catch (error) {
      console.error("Error managing product:", error);
    }
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product._id);
    setProductFormData({
      name: product.name,
      description: product.description,
      price: product.price,
      stock: product.stock,
      category: product.category,
      images: [product.images[0]],
    });
    setShowProductForm(true);
  };

  const handleDeleteProduct = async (productId: string) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      try {
        await deleteProduct(productId);
      } catch (error) {
        console.error("Error deleting product:", error);
      }
    }
  };

  if (user?.role !== "seller" && user?.role !== "admin") {
    return <div>You need to be a seller to access this page.</div>;
  }

  if (loading) {
    return (
      <div className='flex items-center justify-center min-h-screen'>
        <div className='animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500'></div>
      </div>
    );
  }

  if (error) {
    return <div className='text-red-600'>{error}</div>;
  }

  return (
    <div className='max-w-6xl mx-auto p-6'>
      <div className='bg-white rounded-lg shadow-md p-6 mb-8'>
        <h2 className='text-2xl font-bold mb-4'>Store Details</h2>
        {store && (
          <div>
            <p>
              <strong>Name:</strong> {store.name}
            </p>
            <p>
              <strong>Description:</strong> {store.description}
            </p>
            <p>
              <strong>Status:</strong>{" "}
              <span
                className={`capitalize ${
                  store.status === "approved"
                    ? "text-green-600"
                    : store.status === "rejected"
                    ? "text-red-600"
                    : "text-yellow-600"
                }`}
              >
                {store.status}
              </span>
            </p>
          </div>
        )}
      </div>

      <div className='bg-white rounded-lg shadow-md p-6'>
        <div className='flex justify-between items-center mb-6'>
          <h2 className='text-2xl font-bold'>Products</h2>
          <button
            onClick={() => setShowProductForm(true)}
            className='bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700'
          >
            Add Product
          </button>
        </div>

        {showProductForm && (
          <form onSubmit={handleProductSubmit} className='mb-8'>
            <div className='grid grid-cols-2 gap-4'>
              <div>
                <label className='block mb-2'>Name</label>
                <input
                  type='text'
                  value={productFormData.name}
                  onChange={(e) =>
                    setProductFormData({
                      ...productFormData,
                      name: e.target.value,
                    })
                  }
                  className='w-full p-2 border rounded'
                  required
                />
              </div>
              <div>
                <label className='block mb-2'>Category</label>
                <input
                  type='text'
                  value={productFormData.category}
                  onChange={(e) =>
                    setProductFormData({
                      ...productFormData,
                      category: e.target.value,
                    })
                  }
                  className='w-full p-2 border rounded'
                  required
                />
              </div>
              <div>
                <label className='block mb-2'>Price</label>
                <input
                  type='number'
                  value={productFormData.price}
                  onChange={(e) =>
                    setProductFormData({
                      ...productFormData,
                      price: parseFloat(e.target.value),
                    })
                  }
                  className='w-full p-2 border rounded'
                  required
                  min='0'
                  step='0.01'
                />
              </div>
              <div>
                <label className='block mb-2'>Stock</label>
                <input
                  type='number'
                  value={productFormData.stock}
                  onChange={(e) =>
                    setProductFormData({
                      ...productFormData,
                      stock: parseInt(e.target.value),
                    })
                  }
                  className='w-full p-2 border rounded'
                  required
                  min='0'
                />
              </div>
              <div className='col-span-2'>
                <label className='block mb-2'>Description</label>
                <textarea
                  value={productFormData.description}
                  onChange={(e) =>
                    setProductFormData({
                      ...productFormData,
                      description: e.target.value,
                    })
                  }
                  className='w-full p-2 border rounded h-32'
                  required
                />
              </div>
              <div className='col-span-2'>
                <label className='block mb-2'>Image URLs (one per line)</label>
                <textarea
                  value={productFormData.images.join("\n")}
                  onChange={(e) =>
                    setProductFormData({
                      ...productFormData,
                      images: e.target.value.split("\n").filter(Boolean),
                    })
                  }
                  className='w-full p-2 border rounded h-32'
                  required
                />
              </div>
            </div>
            <div className='mt-4 flex gap-2'>
              <button
                type='submit'
                className='bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700'
              >
                {editingProduct ? "Update" : "Create"} Product
              </button>
              <button
                type='button'
                onClick={() => {
                  setShowProductForm(false);
                  setEditingProduct(null);
                }}
                className='bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600'
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
          {products.map((product) => (
            <div
              key={product._id}
              className='border rounded-lg p-4 hover:shadow-lg transition-shadow'
            >
              {product.images && (
                <div className='relative w-full h-48 mb-4'>
                  <Image
                    src={product.images[0]}
                    alt={product.name}
                    fill
                    className='object-scale-down rounded-lg'
                  />
                </div>
              )}
              <h3 className='text-xl font-semibold mb-2'>{product.name}</h3>
              <p className='text-gray-600 mb-2'>{product.description}</p>
              <p className='font-bold mb-2'>${product.price.toFixed(2)}</p>
              <p className='text-sm text-gray-500 mb-4'>
                Stock: {product.stock} | Category: {product.category}
              </p>
              <div className='flex gap-2'>
                <button
                  onClick={() => handleEditProduct(product as Product)}
                  className='bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600'
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDeleteProduct(product._id)}
                  className='bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600'
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StoreManagement;
