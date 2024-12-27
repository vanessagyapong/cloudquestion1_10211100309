"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiShoppingCart,
  FiHeart,
  FiUser,
  FiMenu,
  FiX,
  FiLogOut,
} from "react-icons/fi";
import { FaShoppingBasket } from "react-icons/fa";
import { useCart } from "@/contexts/CartContext";

const navVariants = {
  hidden: { opacity: 0, y: -10 },
  visible: { opacity: 1, y: 0 },
};

const mobileMenuVariants = {
  hidden: { opacity: 0, y: -20, height: 0 },
  visible: { opacity: 1, y: 0, height: "auto" },
  exit: { opacity: 0, y: -20, height: 0 },
};

export default function Navbar() {
  const { user, logout } = useAuth();
  const { items: cartItems } = useCart();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  const isActive = (path: string) => pathname === path;

  const navLinks = user?._id
    ? [
        { href: "/store", label: "Store", icon: FaShoppingBasket },
        { href: "/wishlist", label: "Wishlist", icon: FiHeart },
        { href: "/profile", label: "Profile", icon: FiUser },
        ...(user.role === "seller"
          ? [{ href: "/seller/dashboard", label: "Dashboard" }]
          : []),
      ]
    : [
        { href: "/", label: "Login" },
        { href: "/register", label: "Register" },
      ];

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  return (
    <motion.nav
      initial='hidden'
      animate='visible'
      variants={navVariants}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 backdrop-blur-md ${
        scrolled
          ? "bg-[var(--color-background-primary)] shadow-lg"
          : "bg-[var(--color-background-primary)] bg-opacity-80"
      }`}
    >
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
        <div className='flex items-center justify-between h-16'>
          {/* Logo */}
          <Link href='/' className='flex items-center space-x-2 group'>
            <motion.div
              whileHover={{ rotate: 15, scale: 1.1 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
              className='text-[var(--color-primary)]'
            >
              <FiShoppingCart className='h-6 w-6' />
            </motion.div>
            <span className='text-xl font-bold text-[var(--color-text-primary)] group-hover:text-[var(--color-primary)] transition-colors'>
              Store
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className='hidden md:flex items-center space-x-1'>
            {navLinks.map(({ href, label, icon: Icon }) => (
              <motion.div key={href} whileHover={{ scale: 1.05 }}>
                <Link
                  href={href}
                  className={`flex items-center space-x-1 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                    isActive(href)
                      ? "text-white bg-[var(--color-primary)]"
                      : "text-[var(--color-text-secondary)] hover:text-white hover:bg-[var(--color-primary)]"
                  }`}
                >
                  {Icon && <Icon className='h-4 w-4' />}
                  <span>{label}</span>
                </Link>
              </motion.div>
            ))}
            {/* Cart Link - Only show if authenticated */}
            {user && (
              <motion.div whileHover={{ scale: 1.05 }}>
                <Link
                  href='/cart'
                  className={`flex items-center space-x-1 px-4 py-2 rounded-md text-sm font-medium transition-all relative ${
                    isActive("/cart")
                      ? "text-white bg-[var(--color-primary)]"
                      : "text-[var(--color-text-secondary)] hover:text-white hover:bg-[var(--color-primary)]"
                  }`}
                >
                  <span className='relative'>
                    <FiShoppingCart className='h-4 w-4' />
                    {cartItems.length > 0 && (
                      <span className='absolute -top-2 -right-2 bg-[var(--color-primary)] text-white text-xs font-bold rounded-full h-4 w-4 flex items-center justify-center'>
                        {cartItems.length}
                      </span>
                    )}
                  </span>
                  <span>Cart</span>
                </Link>
              </motion.div>
            )}
            {user && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                onClick={handleLogout}
                className='flex items-center space-x-1 px-4 py-2 rounded-md text-sm font-medium text-[var(--color-error)] hover:bg-[var(--color-error-light)] transition-all'
              >
                <FiLogOut className='h-4 w-4' />
                <span>Logout</span>
              </motion.button>
            )}
          </div>

          {/* Mobile menu button */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            className='md:hidden p-2 rounded-md text-[var(--color-text-secondary)] hover:text-[var(--color-primary)] transition-colors'
            onClick={() => setIsOpen(!isOpen)}
          >
            <AnimatePresence mode='wait'>
              <motion.div
                key={isOpen ? "close" : "menu"}
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 90, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                {isOpen ? (
                  <FiX className='h-6 w-6' />
                ) : (
                  <FiMenu className='h-6 w-6' />
                )}
              </motion.div>
            </AnimatePresence>
          </motion.button>
        </div>
      </div>

      {/* Mobile Navigation */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            variants={mobileMenuVariants}
            initial='hidden'
            animate='visible'
            exit='exit'
            className='md:hidden overflow-hidden'
          >
            <div className='px-2 pt-2 pb-3 space-y-1 bg-[var(--color-background-primary)] shadow-lg'>
              {navLinks.map(({ href, label, icon: Icon }) => (
                <motion.div
                  key={href}
                  whileHover={{ x: 4 }}
                  className='rounded-md overflow-hidden'
                >
                  <Link
                    href={href}
                    onClick={() => setIsOpen(false)}
                    className={`flex items-center space-x-2 px-3 py-2 text-base font-medium transition-colors ${
                      isActive(href)
                        ? "text-white bg-[var(--color-primary)]"
                        : "text-[var(--color-text-secondary)] hover:text-white hover:bg-[var(--color-primary)]"
                    }`}
                  >
                    {Icon && <Icon className='h-5 w-5' />}
                    <span>{label}</span>
                  </Link>
                </motion.div>
              ))}
              {/* Mobile Cart Link - Only show if authenticated */}
              {user && (
                <motion.div
                  whileHover={{ x: 4 }}
                  className='rounded-md overflow-hidden'
                >
                  <Link
                    href='/cart'
                    onClick={() => setIsOpen(false)}
                    className={`flex items-center space-x-2 px-3 py-2 text-base font-medium transition-colors ${
                      isActive("/cart")
                        ? "text-white bg-[var(--color-primary)]"
                        : "text-[var(--color-text-secondary)] hover:text-white hover:bg-[var(--color-primary)]"
                    }`}
                  >
                    <span className='relative'>
                      <FiShoppingCart className='h-5 w-5' />
                      {cartItems.length > 0 && (
                        <span className='absolute -top-2 -right-2 bg-[var(--color-primary)] text-white text-xs font-bold rounded-full h-4 w-4 flex items-center justify-center'>
                          {cartItems.length}
                        </span>
                      )}
                    </span>
                    <span>Cart</span>
                  </Link>
                </motion.div>
              )}
              {user && (
                <motion.button
                  whileHover={{ x: 4 }}
                  onClick={() => {
                    handleLogout();
                    setIsOpen(false);
                  }}
                  className='w-full flex items-center space-x-2 px-3 py-2 text-base font-medium text-[var(--color-error)] hover:bg-[var(--color-error-light)] rounded-md transition-colors'
                >
                  <FiLogOut className='h-5 w-5' />
                  <span>Logout</span>
                </motion.button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}
