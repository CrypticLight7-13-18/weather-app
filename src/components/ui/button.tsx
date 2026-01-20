'use client';

import { cn } from '@/lib/utils';
import { forwardRef, ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'icon' | 'glass' | 'neumorph';
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
        // Glassmorphism primary button
        'bg-gradient-to-r from-blue-500 to-cyan-500 text-white',
        'hover:from-blue-600 hover:to-cyan-600',
        'shadow-[0_4px_20px_rgba(59,130,246,0.4),inset_0_1px_0_rgba(255,255,255,0.2)]',
        'hover:shadow-[0_8px_30px_rgba(59,130,246,0.5),inset_0_1px_0_rgba(255,255,255,0.3)]',
        'active:shadow-[0_2px_10px_rgba(59,130,246,0.3),inset_0_2px_4px_rgba(0,0,0,0.1)]',
        'active:scale-[0.98]'
      ),
      secondary: cn(
        // Neumorphic secondary button
        'bg-slate-100 dark:bg-slate-800',
        'text-slate-700 dark:text-slate-200',
        'shadow-[4px_4px_8px_rgba(174,184,194,0.4),-4px_-4px_8px_rgba(255,255,255,0.8)]',
        'dark:shadow-[4px_4px_8px_rgba(0,0,0,0.4),-4px_-4px_8px_rgba(60,70,85,0.2)]',
        'hover:shadow-[2px_2px_4px_rgba(174,184,194,0.4),-2px_-2px_4px_rgba(255,255,255,0.8)]',
        'dark:hover:shadow-[2px_2px_4px_rgba(0,0,0,0.4),-2px_-2px_4px_rgba(60,70,85,0.2)]',
        'active:shadow-[inset_2px_2px_4px_rgba(174,184,194,0.4),inset_-2px_-2px_4px_rgba(255,255,255,0.7)]',
        'dark:active:shadow-[inset_2px_2px_4px_rgba(0,0,0,0.4),inset_-2px_-2px_4px_rgba(60,70,85,0.2)]'
      ),
      ghost: cn(
        'text-slate-600 dark:text-slate-300',
        'hover:bg-white/50 dark:hover:bg-white/5',
        'hover:shadow-[0_2px_8px_rgba(0,0,0,0.04)]',
        'dark:hover:shadow-[0_2px_8px_rgba(0,0,0,0.15)]'
      ),
      danger: cn(
        'bg-gradient-to-r from-red-500 to-rose-500 text-white',
        'hover:from-red-600 hover:to-rose-600',
        'shadow-[0_4px_20px_rgba(239,68,68,0.4),inset_0_1px_0_rgba(255,255,255,0.2)]',
        'hover:shadow-[0_8px_30px_rgba(239,68,68,0.5)]'
      ),
      icon: cn(
        // Glassmorphic icon button
        'text-slate-500 dark:text-slate-400',
        'hover:text-slate-700 dark:hover:text-slate-200',
        'hover:bg-white/60 dark:hover:bg-white/5',
        'hover:shadow-[0_2px_8px_rgba(0,0,0,0.04),inset_0_1px_0_rgba(255,255,255,0.5)]',
        'dark:hover:shadow-[0_2px_8px_rgba(0,0,0,0.2),inset_0_1px_0_rgba(255,255,255,0.05)]',
        'hover:backdrop-blur-sm'
      ),
      glass: cn(
        // Full glassmorphism button
        'bg-white/40 dark:bg-white/10',
        'backdrop-blur-xl',
        'text-slate-700 dark:text-slate-200',
        'border border-white/50 dark:border-white/20',
        'shadow-[0_4px_16px_rgba(0,0,0,0.06),inset_0_1px_0_rgba(255,255,255,0.5)]',
        'dark:shadow-[0_4px_16px_rgba(0,0,0,0.2),inset_0_1px_0_rgba(255,255,255,0.1)]',
        'hover:bg-white/60 dark:hover:bg-white/15',
        'hover:shadow-[0_8px_24px_rgba(0,0,0,0.1),inset_0_1px_0_rgba(255,255,255,0.6)]',
        'dark:hover:shadow-[0_8px_24px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.15)]'
      ),
      neumorph: cn(
        // Full neumorphism button
        'bg-slate-100 dark:bg-slate-800',
        'text-slate-700 dark:text-slate-200',
        'shadow-[6px_6px_12px_rgba(174,184,194,0.5),-6px_-6px_12px_rgba(255,255,255,0.8)]',
        'dark:shadow-[6px_6px_12px_rgba(0,0,0,0.5),-6px_-6px_12px_rgba(60,70,85,0.3)]',
        'hover:shadow-[4px_4px_8px_rgba(174,184,194,0.5),-4px_-4px_8px_rgba(255,255,255,0.8)]',
        'dark:hover:shadow-[4px_4px_8px_rgba(0,0,0,0.5),-4px_-4px_8px_rgba(60,70,85,0.3)]',
        'active:shadow-[inset_4px_4px_8px_rgba(174,184,194,0.4),inset_-4px_-4px_8px_rgba(255,255,255,0.7)]',
        'dark:active:shadow-[inset_4px_4px_8px_rgba(0,0,0,0.4),inset_-4px_-4px_8px_rgba(60,70,85,0.2)]'
      ),
    };

    const sizeStyles = {
      sm: variant === 'icon' ? 'p-2' : 'px-3 py-1.5 text-sm',
      md: variant === 'icon' ? 'p-2.5' : 'px-4 py-2 text-sm',
      lg: variant === 'icon' ? 'p-3' : 'px-6 py-3 text-base',
    };

    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center font-medium rounded-2xl',
          'transition-all duration-200',
          'focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50 focus-visible:ring-offset-2',
          'dark:focus-visible:ring-offset-slate-900',
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
      title={label}
      className={cn('rounded-full', className)}
      {...props}
    />
  )
);

IconButton.displayName = 'IconButton';
