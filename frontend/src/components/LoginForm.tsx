"use client";

import React, { useState, ChangeEvent, FormEvent } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { motion } from "framer-motion";
import Link from "next/link";
import AnimatedInput from "./AnimatedInput";

export default function LoginForm() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState({
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const validateForm = () => {
    const newErrors = {
      email: "",
      password: "",
    };
    let isValid = true;

    if (!formData.email) {
      newErrors.email = "Email is required";
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
      isValid = false;
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
      isValid = false;
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      await login(formData.email, formData.password);
    } catch {
      // Error is already handled by the AuthContext
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name as keyof typeof errors]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  return (
    <div className='max-w-md mx-auto p-6 space-y-8'>
      <div className='text-center space-y-2'>
        <motion.h2
          className='text-3xl font-extrabold text-[var(--color-text-primary)]'
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          Welcome back
        </motion.h2>
        <motion.p
          className='text-[var(--color-text-secondary)]'
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          Sign in to your account
        </motion.p>
      </div>

      <motion.form
        className='space-y-6'
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        onSubmit={handleSubmit}
      >
        <AnimatedInput
          label='Email'
          name='email'
          type='email'
          value={formData.email}
          onChange={handleChange}
          placeholder='Enter your email'
          autoComplete='email'
          error={errors.email}
        />

        <AnimatedInput
          label='Password'
          name='password'
          type='password'
          value={formData.password}
          onChange={handleChange}
          placeholder='Enter your password'
          autoComplete='current-password'
          error={errors.password}
        />

        <motion.button
          type='submit'
          className='w-full flex justify-center items-center h-11 px-6 
            text-white font-medium text-sm
            bg-[var(--color-primary)] hover:bg-[var(--color-primary-light)]
            rounded-lg shadow-lg shadow-[var(--color-primary)]/20
            focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:ring-offset-2 focus:ring-offset-[var(--color-bg-secondary)]
            disabled:opacity-50 disabled:cursor-not-allowed
            transition-all duration-200'
          disabled={loading}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          {loading ? (
            <div className='flex items-center'>
              <svg
                className='animate-spin -ml-1 mr-3 h-5 w-5 text-white'
                xmlns='http://www.w3.org/2000/svg'
                fill='none'
                viewBox='0 0 24 24'
              >
                <circle
                  className='opacity-25'
                  cx='12'
                  cy='12'
                  r='10'
                  stroke='currentColor'
                  strokeWidth='4'
                ></circle>
                <path
                  className='opacity-75'
                  fill='currentColor'
                  d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
                ></path>
              </svg>
              Signing in...
            </div>
          ) : (
            "Sign in"
          )}
        </motion.button>

        <div className='text-center'>
          <Link
            href='/register'
            className='text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-primary)] transition-colors duration-200'
          >
            Don&apos;t have an account? Sign up
          </Link>
        </div>
      </motion.form>
    </div>
  );
}
