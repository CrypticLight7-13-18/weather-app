'use client';

import { cn } from '@/lib/utils';
import { forwardRef, ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'icon';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      loading = false,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    const variantStyles = {
      primary: cn(
        'bg-gradient-to-r from-sky-500 to-blue-600 text-white',
        'hover:from-sky-600 hover:to-blue-700',
        'shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40',
        'active:scale-[0.98]'
      ),
      secondary: cn(
        'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200',
        'hover:bg-slate-200 dark:hover:bg-slate-700',
        'border border-slate-200 dark:border-slate-700'
      ),
      ghost: cn(
        'text-slate-600 dark:text-slate-300',
        'hover:bg-slate-100 dark:hover:bg-slate-800'
      ),
      danger: cn(
        'bg-red-500 text-white',
        'hover:bg-red-600',
        'shadow-lg shadow-red-500/25'
      ),
      icon: cn(
        'text-slate-500 dark:text-slate-400',
        'hover:bg-slate-100 dark:hover:bg-slate-800',
        'hover:text-slate-700 dark:hover:text-slate-200'
      ),
    };

    const sizeStyles = {
      sm: variant === 'icon' ? 'p-1.5' : 'px-3 py-1.5 text-sm',
      md: variant === 'icon' ? 'p-2' : 'px-4 py-2 text-sm',
      lg: variant === 'icon' ? 'p-3' : 'px-6 py-3 text-base',
    };

    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center font-medium rounded-xl',
          'transition-all duration-200',
          'focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2',
          'disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none',
          variantStyles[variant],
          sizeStyles[size],
          className
        )}
        disabled={disabled || loading}
        {...props}
      >
        {loading ? (
          <>
            <svg
              className="animate-spin -ml-1 mr-2 h-4 w-4"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            Loading...
          </>
        ) : (
          children
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';

// Icon button convenience component
interface IconButtonProps extends Omit<ButtonProps, 'variant'> {
  label: string;
}

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ label, className, ...props }, ref) => (
    <Button
      ref={ref}
      variant="icon"
      aria-label={label}
      className={cn('rounded-full', className)}
      {...props}
    />
  )
);

IconButton.displayName = 'IconButton';

