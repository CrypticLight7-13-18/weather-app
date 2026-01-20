'use client';

import { cn } from '@/lib/utils';
import { forwardRef, HTMLAttributes } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'glass' | 'gradient' | 'elevated';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  hover?: boolean;
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = 'default', padding = 'md', hover = false, children, ...props }, ref) => {
    const variantStyles = {
      default: cn(
        'bg-white dark:bg-slate-800/90',
        'border border-slate-200/80 dark:border-slate-700/50',
        'shadow-[0_1px_3px_rgba(0,0,0,0.04),0_1px_2px_rgba(0,0,0,0.06)]',
        'dark:shadow-[0_1px_3px_rgba(0,0,0,0.3)]'
      ),
      glass: cn(
        'bg-white/70 dark:bg-slate-800/80',
        'backdrop-blur-xl backdrop-saturate-150',
        'border border-white/50 dark:border-slate-700/50',
        'shadow-[0_4px_20px_rgba(0,0,0,0.04)]',
        'dark:shadow-[0_4px_20px_rgba(0,0,0,0.3)]'
      ),
      gradient: cn(
        'bg-linear-to-br from-white via-white to-slate-50/80',
        'dark:from-slate-800 dark:via-slate-800 dark:to-slate-900',
        'border border-slate-200/60 dark:border-slate-700/50',
        'shadow-[0_2px_8px_rgba(0,0,0,0.04)]',
        'dark:shadow-[0_2px_8px_rgba(0,0,0,0.3)]'
      ),
      elevated: cn(
        'bg-white dark:bg-slate-800/90',
        'border border-slate-100 dark:border-slate-700/50',
        'shadow-[0_4px_12px_rgba(0,0,0,0.05),0_1px_3px_rgba(0,0,0,0.05)]',
        'dark:shadow-[0_4px_12px_rgba(0,0,0,0.4)]'
      ),
    };

    const paddingStyles = {
      none: '',
      sm: 'p-3 sm:p-4',
      md: 'p-4 sm:p-5',
      lg: 'p-5 sm:p-6',
    };

    const hoverStyles = hover
      ? 'transition-all duration-300 hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)] hover:-translate-y-0.5 dark:hover:shadow-[0_8px_30px_rgba(0,0,0,0.4)]'
      : 'transition-colors duration-200';

    return (
      <div
        ref={ref}
        className={cn(
          'rounded-2xl',
          variantStyles[variant],
          paddingStyles[padding],
          hoverStyles,
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';

interface CardHeaderProps extends HTMLAttributes<HTMLDivElement> {}

export const CardHeader = forwardRef<HTMLDivElement, CardHeaderProps>(
  ({ className, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('flex items-center justify-between mb-4', className)}
      {...props}
    >
      {children}
    </div>
  )
);

CardHeader.displayName = 'CardHeader';

interface CardTitleProps extends HTMLAttributes<HTMLHeadingElement> {
  as?: 'h1' | 'h2' | 'h3' | 'h4';
}

export const CardTitle = forwardRef<HTMLHeadingElement, CardTitleProps>(
  ({ className, as: Tag = 'h3', children, ...props }, ref) => (
    <Tag
      ref={ref}
      className={cn(
        'text-sm font-semibold uppercase tracking-wider',
        'text-slate-500 dark:text-slate-400',
        className
      )}
      {...props}
    >
      {children}
    </Tag>
  )
);

CardTitle.displayName = 'CardTitle';

interface CardContentProps extends HTMLAttributes<HTMLDivElement> {}

export const CardContent = forwardRef<HTMLDivElement, CardContentProps>(
  ({ className, children, ...props }, ref) => (
    <div ref={ref} className={cn('', className)} {...props}>
      {children}
    </div>
  )
);

CardContent.displayName = 'CardContent';
