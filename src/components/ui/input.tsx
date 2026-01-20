'use client';

import { cn } from '@/lib/utils';
import { forwardRef, InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  icon?: React.ReactNode;
  suffix?: React.ReactNode;
  error?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, icon, suffix, error, ...props }, ref) => {
    return (
      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500">
            {icon}
          </div>
        )}
        <input
          ref={ref}
          className={cn(
            'w-full rounded-xl',
            // Light mode
            'bg-white border-slate-200 text-slate-900',
            'placeholder:text-slate-400',
            'focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20',
            // Dark mode
            'dark:bg-slate-800 dark:border-slate-700 dark:text-white',
            'dark:placeholder:text-slate-500',
            'dark:focus:border-blue-400 dark:focus:ring-blue-400/20',
            // Common
            'border transition-all duration-200',
            'focus:outline-none',
            icon ? 'pl-10' : 'pl-4',
            suffix ? 'pr-10' : 'pr-4',
            'py-3',
            error && 'border-red-300 dark:border-red-700 focus:border-red-500 focus:ring-red-500/20',
            className
          )}
          {...props}
        />
        {suffix && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500">
            {suffix}
          </div>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
