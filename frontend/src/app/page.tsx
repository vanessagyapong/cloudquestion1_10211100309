"use client";

import { motion, Variants } from "framer-motion";
import LoginForm from "../components/LoginForm";
import IsAuth from "../components/IsAuth";

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.5,
      staggerChildren: 0.1,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 24,
    },
  },
};

export default function Home() {
  return (
    <IsAuth>
      <div className='min-h-screen flex items-center justify-center bg-[var(--color-bg-primary)]'>
        <div className='max-w-md w-full space-y-8 p-8 bg-[var(--color-bg-secondary)] rounded-xl shadow-2xl border border-[var(--color-border-primary)]'>
          <motion.div
            variants={containerVariants}
            initial='hidden'
            animate='visible'
            className='space-y-8'
            style={{ display: "flex", flexDirection: "column", gap: "2rem" }}
          >
            <motion.div variants={itemVariants}>
              <LoginForm />
            </motion.div>
          </motion.div>
        </div>
      </div>
    </IsAuth>
  );
}
