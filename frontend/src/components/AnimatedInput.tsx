import React, { ChangeEvent } from "react";

interface InputProps {
  label: string;
  name: string;
  value: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  type: string;
  placeholder: string;
  autoComplete?: string;
  error?: string;
  required?: boolean;
}

const AnimatedInput = ({
  label,
  name,
  value,
  onChange,
  type,
  placeholder,
  autoComplete,
  error,
  required = true,
}: InputProps) => {
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
        <input
          id={name}
          name={name}
          type={type}
          autoComplete={autoComplete}
          required={required}
          value={value}
          onChange={onChange}
          className={`block w-full px-4 py-2.5 bg-[var(--color-bg-primary)] border rounded-lg shadow-sm 
            text-[var(--color-text-primary)] placeholder-[var(--color-text-tertiary)]
            focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent
            disabled:opacity-50 disabled:cursor-not-allowed
            transition-all duration-200
            ${
              error
                ? "border-[var(--color-error)]"
                : "border-[var(--color-border-primary)]"
            }
            ${
              error
                ? "focus:ring-[var(--color-error)]"
                : "focus:ring-[var(--color-primary)]"
            }`}
          placeholder={placeholder}
        />
        {error && (
          <p className='mt-1 text-sm text-[var(--color-error)]'>{error}</p>
        )}
      </div>
    </div>
  );
};

export default AnimatedInput;
