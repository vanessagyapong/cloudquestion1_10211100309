import React, { useState } from "react";
import Image from "next/image";
import { Product } from "@/types/product";

interface ProductListProps {
  products: Product[];
}

const ProductList = ({ products }: ProductListProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");

  // Get unique categories from products
  const categories = Array.from(new Set(products.map((p) => p.category)));

  // Filter products based on search and category
  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      !selectedCategory || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className='max-w-6xl mx-auto p-6'>
      <div className='mb-8'>
        <div className='flex gap-4 mb-4'>
          <input
            type='text'
            placeholder='Search products...'
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className='flex-1 p-2 bg-neutral-800 border border-neutral-700 rounded text-white placeholder-gray-400'
          />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className='p-2 bg-neutral-800 border border-neutral-700 rounded text-white'
          >
            <option value=''>All Categories</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
        {filteredProducts.map((product) => (
          <div
            key={product._id}
            className='bg-neutral-800 border border-neutral-700 rounded-lg p-4 hover:shadow-lg transition-shadow'
          >
            {product.images[0] && (
              <div className='relative w-full h-48 mb-4'>
                <Image
                  src={product.images[0]}
                  alt={product.name}
                  fill
                  className='object-scale-down rounded-lg'
                />
              </div>
            )}
            <h3 className='text-xl font-semibold mb-2 text-white'>
              {product.name}
            </h3>
            <p className='text-gray-400 mb-2'>{product.description}</p>
            <p className='font-bold mb-2 text-white'>
              ${product.price.toFixed(2)}
            </p>
            <p className='text-sm text-gray-400 mb-2'>
              Category: {product.category}
            </p>
            <p className='text-sm text-gray-400 mb-4'>
              Seller: {product.store.name}
            </p>
            <button
              disabled={product.stock === 0}
              className={`w-full py-2 px-4 rounded text-white ${
                product.stock > 0
                  ? "bg-white hover:bg-neutral-200"
                  : "bg-gray-600 cursor-not-allowed"
              }`}
            >
              {product.stock > 0 ? "Add to Cart" : "Out of Stock"}
            </button>
          </div>
        ))}
      </div>

      {filteredProducts.length === 0 && (
        <div className='text-center text-gray-400 mt-8'>
          No products found. Try adjusting your search or filters.
        </div>
      )}
    </div>
  );
};

export default ProductList;
