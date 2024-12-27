"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Product } from "@/types/product";
import { productsApi } from "@/services/api";
import { useCart } from "@/contexts/CartContext";
import { useWishlist } from "@/contexts/WishlistContext";
import { toast } from "sonner";
import ProductCard from "@/components/ProductCard";

type Category = "All" | "Electronics" | "Clothing" | "Books" | "Home" | "Other";

export default function Store() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<Category>("All");
  const { addToCart } = useCart();
  const { toggleWishlist, wishlist } = useWishlist();
  const router = useRouter();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await productsApi.getProducts();
        setProducts(response.data.data);
      } catch (error) {
        console.error("Error fetching products:", error);
        toast.error("Failed to fetch products");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === "All" || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  if (loading) {
    return (
      <div className='min-h-screen bg-[var(--color-background-secondary)] flex items-center justify-center'>
        <div className='h-12 w-12 border-4 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin'></div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-[var(--color-background-secondary)] py-8 pt-24'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
        <div className='flex flex-col md:flex-row gap-4 mb-8'>
          <input
            type='text'
            placeholder='Search products...'
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className='flex-1 px-4 py-2 rounded-lg border border-[var(--color-border)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] bg-white'
          />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value as Category)}
            className='px-4 py-2 rounded-lg border border-[var(--color-border)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] bg-white'
          >
            <option value='All'>All Categories</option>
            <option value='Electronics'>Electronics</option>
            <option value='Clothing'>Clothing</option>
            <option value='Books'>Books</option>
            <option value='Home'>Home</option>
            <option value='Other'>Other</option>
          </select>
        </div>

        {filteredProducts.length === 0 ? (
          <div className='text-center py-12'>
            <p className='text-[var(--color-text-secondary)]'>
              No products found matching your criteria.
            </p>
          </div>
        ) : (
          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'>
            {filteredProducts.map((product) => (
              <ProductCard
                key={product._id}
                product={product}
                onAddToCart={() => {
                  addToCart(product._id, 1);
                  toast.success("Added to cart");
                }}
                onToggleWishlist={() => toggleWishlist(product._id)}
                isInWishlist={wishlist.some(
                  (item) => item?._id === product?._id
                )}
                onClick={() => router.push(`/productDetails/${product._id}`)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
