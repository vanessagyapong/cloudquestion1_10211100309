import React, { useState } from "react";
import { Product } from "@/types/product";
import { productsApi } from "@/services/api";
import { toast } from "sonner";

interface ProductFormModalProps {
  product?: Product | null;
  onClose: () => void;
  onSave: (product: Product) => void;
}

interface ProductFormData {
  name: string;
  description: string;
  price: number;
  category: string;
  stock: number;
  images: string[];
}

export default function ProductFormModal({
  product,
  onClose,
  onSave,
}: ProductFormModalProps) {
  const [formData, setFormData] = useState<ProductFormData>({
    name: product?.name || "",
    description: product?.description || "",
    price: product?.price || 0,
    category: product?.category || "",
    stock: product?.stock || 0,
    images: product?.images || [],
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const formDataToSend = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        if (key === "images" && Array.isArray(value)) {
          value.forEach((image, index) => {
            formDataToSend.append(`images[${index}]`, image);
          });
        } else {
          formDataToSend.append(key, String(value));
        }
      });

      const response = product?._id
        ? await productsApi.updateProduct(product._id, formData)
        : await productsApi.createProduct(formData);

      onSave(response.data.data);
      onClose();
      toast.success(
        product?._id
          ? "Product updated successfully"
          : "Product created successfully"
      );
    } catch (error) {
      console.error("Error saving product:", error);
      toast.error("Failed to save product");
    }
  };

  return (
    <div className='fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center'>
      <div className='bg-white rounded-lg p-8 max-w-md w-full'>
        <h2 className='text-xl font-bold mb-4'>
          {product ? "Edit Product" : "Add New Product"}
        </h2>
        <form onSubmit={handleSubmit} className='space-y-4'>
          <div>
            <label className='block text-sm font-medium text-gray-700'>
              Name
            </label>
            <input
              type='text'
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className='mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500'
              required
            />
          </div>
          <div>
            <label className='block text-sm font-medium text-gray-700'>
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              className='mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500'
              required
            />
          </div>
          <div>
            <label className='block text-sm font-medium text-gray-700'>
              Price
            </label>
            <input
              type='number'
              step='0.01'
              value={formData.price}
              onChange={(e) =>
                setFormData({ ...formData, price: Number(e.target.value) })
              }
              className='mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500'
              required
            />
          </div>
          <div>
            <label className='block text-sm font-medium text-gray-700'>
              Category
            </label>
            <select
              value={formData.category}
              onChange={(e) =>
                setFormData({ ...formData, category: e.target.value })
              }
              className='mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500'
              required
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
            <label className='block text-sm font-medium text-gray-700'>
              Stock Quantity
            </label>
            <input
              type='number'
              value={formData.stock}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  stock: Number(e.target.value),
                })
              }
              className='mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500'
              required
            />
          </div>
          <div>
            <label className='block text-sm font-medium text-gray-700'>
              Image URL
            </label>
            <input
              type='text'
              value={formData.images[0] || ""}
              onChange={(e) =>
                setFormData({ ...formData, images: [e.target.value] })
              }
              className='mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500'
              required
            />
          </div>
          <div className='flex justify-end space-x-4'>
            <button
              type='button'
              onClick={onClose}
              className='px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md'
            >
              Cancel
            </button>
            <button
              type='submit'
              className='px-4 py-2 text-sm font-medium text-white bg-blue-500 hover:bg-blue-600 rounded-md'
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
