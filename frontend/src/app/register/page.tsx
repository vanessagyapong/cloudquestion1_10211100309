"use client";

import { motion, Variants } from "framer-motion";
import RegisterForm from "../../components/RegisterForm";
import IsAuth from "../../components/IsAuth";
import Link from "next/link";

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

export default function Register() {
  return (
    <IsAuth>
      <div className='min-h-screen py-16 bg-[var(--color-bg-primary)]'>
        <div className='container mx-auto px-4'>
          <motion.div
            variants={containerVariants}
            initial='hidden'
            animate='visible'
            className='max-w-4xl mx-auto'
          >
            <motion.div
              variants={itemVariants}
              className='bg-[var(--color-bg-secondary)] rounded-2xl shadow-2xl border border-[var(--color-border-primary)] backdrop-blur-lg'
            >
              <RegisterForm />
            </motion.div>

            <motion.div variants={itemVariants} className='mt-6 text-center'>
              <p className='text-[var(--color-text-secondary)]'>
                Already have an account?{" "}
                <Link
                  href='/'
                  className='font-medium text-[var(--color-primary)] hover:text-[var(--color-primary-light)] transition-colors duration-200'
                >
                  Sign in here
                </Link>
              </p>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </IsAuth>
  );
}
