import React from "react";
import { motion } from "framer-motion";

const categories = [
  "All",
  "Electronics",
  "Clothing",
  "Books",
  "Home & Garden",
  "Sports",
] as const;

type Category = (typeof categories)[number];

interface CategoryNavProps {
  selectedCategory: Category;
  onCategoryChange: (category: Category) => void;
}

export default function CategoryNav({
  selectedCategory,
  onCategoryChange,
}: CategoryNavProps) {
  return (
    <nav className='mb-8'>
      <ul className='flex space-x-4 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-gray-800'>
        {categories.map((category) => (
          <li key={category}>
            <motion.button
              onClick={() => onCategoryChange(category)}
              className={`px-4 py-2 rounded-full transition-colors whitespace-nowrap ${
                selectedCategory === category
                  ? "bg-indigo-600 text-white"
                  : "bg-neutral-800 text-gray-300 hover:bg-gray-700 hover:text-white"
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {category}
            </motion.button>
          </li>
        ))}
      </ul>
    </nav>
  );
}
