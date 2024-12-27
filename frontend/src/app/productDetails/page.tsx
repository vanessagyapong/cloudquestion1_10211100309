"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";

export default function ProductDetails() {
  return (
    <div className='min-h-screen  py-8'>
      <div className='max-w-6xl mx-auto px-4'>
        <Link
          href='/store'
          className='text-indigo-400 hover:text-indigo-300 mb-4 inline-block'
        >
          ← Back to Products
        </Link>

        <div className='bg-neutral-800 rounded-lg shadow-lg p-6 grid md:grid-cols-2 gap-8 border border-neutral-700'>
          <div className='relative h-96'>
            <Image
              src='/next.svg'
              alt='Product'
              fill
              className='object-contain'
            />
          </div>

          <div>
            <h1 className='text-3xl font-bold mb-4'>Product Name</h1>
            <p className='text-gray-600 mb-4'>Product Description</p>
            <div className='text-2xl font-bold mb-4'>$99.99</div>
            <div className='mb-4'>
              <span className='text-gray-600'>Stock: </span>
              <span className='font-semibold'>10 units</span>
            </div>
            <button className='w-full bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors'>
              Add to Cart
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
