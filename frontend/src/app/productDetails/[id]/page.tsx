"use client";

import React, { use, useState } from "react";
import { useRouter } from "next/navigation";
import { Product } from "@/types/product";
import { productsApi } from "@/services/api";
import { useCart } from "@/contexts/CartContext";
import { useWishlist } from "@/contexts/WishlistContext";
import { toast } from "sonner";
import { FaHeart, FaRegHeart } from "react-icons/fa";
import { IoIosArrowBack } from "react-icons/io";
import Image from "next/image";

interface ProductDetailsPageProps {
  params: Promise<{ id: string }>;
}

export default function ProductDetails({ params }: ProductDetailsPageProps) {
  const { id } = use(params);
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const router = useRouter();
  const { addToCart } = useCart();
  const { toggleWishlist, wishlist } = useWishlist();

  React.useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const response = await productsApi.getProduct(id as string);
        setProduct(response.data.data);
      } catch (error) {
        console.error("Error fetching product:", error);
        toast.error("Failed to fetch product details");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProduct();
    }
  }, [id]);

  const handleAddToCart = async () => {
    if (!product) return;
    try {
      await addToCart(product._id, quantity);
      toast.success("Added to cart successfully");
    } catch (error) {
      console.error("Error adding to cart:", error);
      toast.error("Failed to add to cart");
    }
  };

  const handleToggleWishlist = async () => {
    if (!product) return;
    try {
      await toggleWishlist(product._id);
    } catch (error) {
      console.error("Error toggling wishlist:", error);
      toast.error("Failed to update wishlist");
    }
  };

  const isInWishlist =
    product && wishlist.some((item) => item.product._id === product._id);

  if (loading) {
    return (
      <div className='min-h-screen bg-[var(--color-background-secondary)] flex items-center justify-center'>
        <div className='h-12 w-12 border-4 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin'></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className='min-h-screen bg-[var(--color-background-secondary)] flex flex-col items-center justify-center gap-4'>
        <p className='text-[var(--color-text-primary)]'>Product not found</p>
        <button
          onClick={() => router.back()}
          className='flex items-center gap-2 text-[var(--color-primary)] hover:text-[var(--color-primary-dark)]'
        >
          <IoIosArrowBack /> Go back
        </button>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-[var(--color-background-secondary)] py-8'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
        <button
          onClick={() => router.back()}
          className='flex items-center gap-2 text-[var(--color-primary)] hover:text-[var(--color-primary-dark)] mb-6'
        >
          <IoIosArrowBack /> Back to store
        </button>

        <div className='bg-white rounded-lg shadow-sm p-6'>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-8'>
            {/* Image Slider */}
            <div className='relative aspect-square rounded-lg overflow-hidden'>
              <Image
                src={product.images[currentImageIndex] || "/placeholder.png"}
                alt={product.name}
                fill
                className='object-cover'
              />
              {product.images.length > 1 && (
                <div className='absolute bottom-4 left-0 right-0 flex justify-center gap-2'>
                  {product.images.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`w-2 h-2 rounded-full ${
                        currentImageIndex === index
                          ? "bg-[var(--color-primary)]"
                          : "bg-gray-300"
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Product Info */}
            <div className='flex flex-col gap-4'>
              <h1 className='text-2xl font-bold text-[var(--color-text-primary)]'>
                {product.name}
              </h1>
              <p className='text-[var(--color-text-secondary)]'>
                {product.description}
              </p>
              <div className='flex items-center justify-between'>
                <p className='text-xl font-semibold text-[var(--color-primary)]'>
                  ${product.price.toFixed(2)}
                </p>
                <button
                  onClick={handleToggleWishlist}
                  className='text-[var(--color-primary)] hover:text-[var(--color-primary-dark)]'
                >
                  {isInWishlist ? (
                    <FaHeart size={24} />
                  ) : (
                    <FaRegHeart size={24} />
                  )}
                </button>
              </div>
              <div className='flex items-center gap-4 mt-4'>
                <div className='flex items-center border border-[var(--color-border)] rounded'>
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className='px-3 py-2 text-[var(--color-text-primary)] hover:bg-[var(--color-background-secondary)]'
                  >
                    -
                  </button>
                  <span className='px-4 py-2 border-x border-[var(--color-border)]'>
                    {quantity}
                  </span>
                  <button
                    onClick={() =>
                      setQuantity(Math.min(product.stock, quantity + 1))
                    }
                    className='px-3 py-2 text-[var(--color-text-primary)] hover:bg-[var(--color-background-secondary)]'
                  >
                    +
                  </button>
                </div>
                <button
                  onClick={handleAddToCart}
                  disabled={product.stock === 0}
                  className='flex-1 btn-primary py-2'
                >
                  {product.stock === 0 ? "Out of Stock" : "Add to Cart"}
                </button>
              </div>
              <div className='mt-4'>
                <p className='text-sm text-[var(--color-text-secondary)]'>
                  Category: {product.category}
                </p>
                <p className='text-sm text-[var(--color-text-secondary)]'>
                  Stock: {product.stock} units
                </p>
                <p className='text-sm text-[var(--color-text-secondary)]'>
                  Sales: {product.sales} sold
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
