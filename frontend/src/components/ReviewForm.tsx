"use client";

import React, { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { productsApi } from "../services/api";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface ReviewFormProps {
  productId: string;
}

export default function ReviewForm({ productId }: ReviewFormProps) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast.error("Please log in to submit a review");
      return;
    }

    try {
      setLoading(true);
      await productsApi.submitReview(productId, rating, comment);
      toast.success("Review submitted successfully!");
      setRating(5);
      setComment("");
      router.refresh();
    } catch (error) {
      console.error("Error submitting review:", error);
      toast.error("Failed to submit review");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className='space-y-4'>
      <div>
        <label
          htmlFor='rating'
          className='block text-sm font-medium text-gray-700'
        >
          Rating
        </label>
        <select
          id='rating'
          value={rating}
          onChange={(e) => setRating(Number(e.target.value))}
          className='mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm'
          disabled={loading}
        >
          {[5, 4, 3, 2, 1].map((value) => (
            <option key={value} value={value}>
              {value} {value === 1 ? "star" : "stars"}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label
          htmlFor='comment'
          className='block text-sm font-medium text-gray-700'
        >
          Comment
        </label>
        <textarea
          id='comment'
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={4}
          className='mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm'
          placeholder='Write your review here...'
          disabled={loading}
        />
      </div>

      <button
        type='submit'
        disabled={loading || !comment.trim()}
        className='inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed'
      >
        {loading ? "Submitting..." : "Submit Review"}
      </button>
    </form>
  );
}
