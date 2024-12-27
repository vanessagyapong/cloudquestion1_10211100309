"use client";

import React, { ChangeEvent, FormEvent, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Gender } from "@/types/user";
import { toast } from "sonner";
import { motion } from "framer-motion";

interface InputProps {
  label: string;
  name: string;
  value: string;
  onChange: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  type: string;
  placeholder?: string;
  autoComplete?: string;
  required?: boolean;
  maxLength?: number;
}

interface ButtonProps {
  isLoading: boolean;
  children: React.ReactNode;
}

interface SelectInputProps {
  label: string;
  name: string;
  value: string;
  onChange: (e: ChangeEvent<HTMLSelectElement>) => void;
  options: Array<{ value: string; label: string }>;
  required?: boolean;
}

interface CheckboxInputProps {
  name: string;
  label: string;
  checked: boolean;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
}

interface SectionTitleProps {
  children: React.ReactNode;
}

const AnimatedInput = ({
  label,
  name,
  value,
  onChange,
  type,
  placeholder,
  autoComplete,
  required = true,
  maxLength,
}: InputProps) => {
  const isTextArea = type === "textarea";
  const Component = isTextArea ? "textarea" : "input";

  return (
    <div className='group'>
      <label
        htmlFor={name}
        className='block text-sm font-medium mb-1.5 text-[var(--color-text-secondary)] group-focus-within:text-[var(--color-primary)] transition-colors duration-200'
      >
        {label}{" "}
        {required && <span className='text-[var(--color-error)]'>*</span>}
      </label>
      <div className='relative'>
        <Component
          id={name}
          name={name}
          type={type !== "textarea" ? type : undefined}
          autoComplete={autoComplete}
          required={required}
          value={value}
          onChange={onChange}
          maxLength={maxLength}
          rows={isTextArea ? 4 : undefined}
          className='block w-full px-4 py-2.5 bg-[var(--color-bg-primary)] border border-[var(--color-border-primary)] rounded-lg shadow-sm 
            text-[var(--color-text-primary)] placeholder-[var(--color-text-tertiary)]
            focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent
            disabled:opacity-50 disabled:cursor-not-allowed
            transition-all duration-200'
          placeholder={placeholder}
        />
        {maxLength && (
          <div className='absolute right-2 bottom-2 text-xs text-[var(--color-text-tertiary)]'>
            {value.length}/{maxLength}
          </div>
        )}
      </div>
    </div>
  );
};

const AnimatedButton = ({ isLoading, children }: ButtonProps) => {
  return (
    <motion.button
      type='submit'
      className='w-full flex justify-center items-center h-11 px-6 
        text-white font-medium text-sm
        bg-[var(--color-primary)] hover:bg-[var(--color-primary-light)]
        rounded-lg shadow-lg shadow-[var(--color-primary)]/20
        focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:ring-offset-2 focus:ring-offset-[var(--color-bg-secondary)]
        disabled:opacity-50 disabled:cursor-not-allowed
        transition-all duration-200'
      disabled={isLoading}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      {isLoading ? (
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
          Creating account...
        </div>
      ) : (
        children
      )}
    </motion.button>
  );
};

const SelectInput = ({
  label,
  name,
  value,
  onChange,
  options,
  required = false,
}: SelectInputProps) => (
  <div className='group'>
    <label
      htmlFor={name}
      className='block text-sm font-medium mb-1.5 text-[var(--color-text-secondary)] group-focus-within:text-[var(--color-primary)] transition-colors duration-200'
    >
      {label} {required && <span className='text-[var(--color-error)]'>*</span>}
    </label>
    <select
      id={name}
      name={name}
      value={value}
      onChange={onChange}
      className='block w-full px-4 py-2.5 bg-[var(--color-bg-primary)] border border-[var(--color-border-primary)] rounded-lg shadow-sm 
        text-[var(--color-text-primary)] 
        focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent
        disabled:opacity-50 disabled:cursor-not-allowed
        transition-all duration-200'
    >
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  </div>
);

const CheckboxInput = ({
  name,
  label,
  checked,
  onChange,
}: CheckboxInputProps) => (
  <motion.label
    className='flex items-center space-x-3 p-3 rounded-lg hover:bg-[var(--color-bg-secondary)] cursor-pointer transition-colors duration-200'
    whileHover={{ scale: 1.02 }}
    whileTap={{ scale: 0.98 }}
  >
    <input
      type='checkbox'
      name={name}
      checked={checked}
      onChange={onChange}
      className='w-4 h-4 rounded-md border-2 border-[var(--color-border-primary)] bg-[var(--color-bg-primary)] 
        text-[var(--color-primary)] 
        focus:ring-2 focus:ring-[var(--color-primary)] focus:ring-offset-0
        transition-all duration-200'
    />
    <span className='text-sm text-[var(--color-text-secondary)]'>{label}</span>
  </motion.label>
);

const SectionTitle = ({ children }: SectionTitleProps) => (
  <div className='flex items-center space-x-2 mb-6'>
    <h3 className='text-xl font-semibold text-[var(--color-text-primary)]'>
      {children}
    </h3>
    <div className='flex-grow h-px bg-gradient-to-r from-[var(--color-border-primary)] via-[var(--color-primary)]/20 to-[var(--color-border-primary)]'></div>
  </div>
);

const RegisterForm = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    gender: Gender.MALE,
    dateOfBirth: "",
    bio: "",
    preferences: {
      language: "en",
      currency: "USD",
      notifications: {
        email: true,
        push: true,
        sms: false,
      },
    },
  });
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await register(formData);
      toast.success("Registration successful!");
    } catch (err) {
      console.error("Registration error:", err);
      if (err instanceof Error) {
        toast.error(err.message);
      } else {
        toast.error("Registration failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    if (name.startsWith("notifications.")) {
      const notificationType = name.split(".")[1];
      setFormData((prev) => ({
        ...prev,
        preferences: {
          ...prev.preferences,
          notifications: {
            ...prev.preferences.notifications,
            [notificationType]: (e.target as HTMLInputElement).checked,
          },
        },
      }));
    } else if (name === "language" || name === "currency") {
      setFormData((prev) => ({
        ...prev,
        preferences: {
          ...prev.preferences,
          [name]: value,
        },
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  return (
    <div className='max-w-4xl mx-auto p-6 space-y-8'>
      <div className='text-center space-y-2'>
        <motion.h2
          className='text-3xl font-extrabold text-[var(--color-text-primary)]'
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          Create your account
        </motion.h2>
        <motion.p
          className='text-[var(--color-text-secondary)]'
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          Join our community and start exploring
        </motion.p>
      </div>

      <motion.form
        className='bg-[var(--color-bg-secondary)] rounded-xl shadow-lg p-6 md:p-8 space-y-8'
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        onSubmit={handleSubmit}
      >
        {/* Personal Information Section */}
        <div className='space-y-8'>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <SectionTitle>Personal Information</SectionTitle>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
              <AnimatedInput
                label='Full Name'
                name='name'
                type='text'
                value={formData.name}
                onChange={handleChange}
                placeholder='Enter your full name'
                autoComplete='name'
              />
              <AnimatedInput
                label='Email'
                name='email'
                type='email'
                value={formData.email}
                onChange={handleChange}
                placeholder='Enter your email'
                autoComplete='email'
              />
              <AnimatedInput
                label='Password'
                name='password'
                type='password'
                value={formData.password}
                onChange={handleChange}
                placeholder='Enter your password'
                autoComplete='new-password'
              />
              <AnimatedInput
                label='Phone'
                name='phone'
                type='tel'
                value={formData.phone}
                onChange={handleChange}
                placeholder='Enter your phone number'
                autoComplete='tel'
                required={false}
              />
              <SelectInput
                label='Gender'
                name='gender'
                value={formData.gender}
                onChange={handleChange}
                options={[
                  { value: Gender.MALE, label: "Male" },
                  { value: Gender.FEMALE, label: "Female" },
                  { value: Gender.OTHER, label: "Other" },
                ]}
              />
              <AnimatedInput
                label='Date of Birth'
                name='dateOfBirth'
                type='date'
                value={formData.dateOfBirth}
                onChange={handleChange}
                autoComplete='bday'
                required={false}
              />
            </div>
          </motion.div>

          {/* Bio Section */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            <SectionTitle>About You</SectionTitle>
            <AnimatedInput
              label='Bio'
              name='bio'
              type='textarea'
              value={formData.bio}
              onChange={handleChange}
              placeholder='Tell us about yourself'
              required={false}
              maxLength={500}
            />
          </motion.div>

          {/* Preferences Section */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.6 }}
          >
            <SectionTitle>Preferences</SectionTitle>
            <div className='space-y-6'>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                <SelectInput
                  label='Language'
                  name='language'
                  value={formData.preferences.language}
                  onChange={handleChange}
                  options={[
                    { value: "en", label: "English" },
                    { value: "es", label: "Spanish" },
                    { value: "fr", label: "French" },
                  ]}
                />
                <SelectInput
                  label='Currency'
                  name='currency'
                  value={formData.preferences.currency}
                  onChange={handleChange}
                  options={[
                    { value: "USD", label: "USD" },
                    { value: "EUR", label: "EUR" },
                    { value: "GBP", label: "GBP" },
                  ]}
                />
              </div>

              <div className='bg-[var(--color-bg-primary)] rounded-lg p-6 border border-[var(--color-border-primary)]'>
                <label className='block text-sm font-medium text-[var(--color-text-secondary)] mb-4'>
                  Notification Preferences
                </label>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                  <CheckboxInput
                    name='notifications.email'
                    label='Email notifications'
                    checked={formData.preferences.notifications.email}
                    onChange={handleChange}
                  />
                  <CheckboxInput
                    name='notifications.push'
                    label='Push notifications'
                    checked={formData.preferences.notifications.push}
                    onChange={handleChange}
                  />
                  <div className='md:col-span-2'>
                    <CheckboxInput
                      name='notifications.sms'
                      label='SMS notifications'
                      checked={formData.preferences.notifications.sms}
                      onChange={handleChange}
                    />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.7 }}
        >
          <AnimatedButton isLoading={loading}>Create Account</AnimatedButton>
        </motion.div>
      </motion.form>
    </div>
  );
};

export default RegisterForm;
