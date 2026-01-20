'use client';

import { cn } from '@/lib/utils';
import { forwardRef, HTMLAttributes } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'glass' | 'gradient' | 'elevated' | 'neumorph' | 'neumorph-inset';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  hover?: boolean;
  glow?: 'none' | 'blue' | 'purple' | 'amber';
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = 'default', padding = 'md', hover = false, glow = 'none', children, ...props }, ref) => {
    const variantStyles = {
      default: cn(
        // Light mode - soft neumorphic
        'bg-slate-50/80',
        'shadow-[6px_6px_12px_rgba(163,177,198,0.35),-6px_-6px_12px_rgba(255,255,255,0.9)]',
        'border border-white/60',
        // Dark mode - dark neumorphic
        'dark:bg-slate-800/90',
        'dark:shadow-[6px_6px_12px_rgba(0,0,0,0.4),-6px_-6px_12px_rgba(55,65,81,0.3)]',
        'dark:border-slate-700/30'
      ),
      glass: cn(
        // Glassmorphism
        'bg-white/40 dark:bg-slate-900/40',
        'backdrop-blur-2xl backdrop-saturate-200',
        'border border-white/50 dark:border-white/10',
        'shadow-[0_8px_32px_rgba(0,0,0,0.08),inset_0_0_0_1px_rgba(255,255,255,0.1)]',
        'dark:shadow-[0_8px_32px_rgba(0,0,0,0.4),inset_0_0_0_1px_rgba(255,255,255,0.05)]'
      ),
      gradient: cn(
        // Glass with gradient
        'bg-gradient-to-br from-white/60 via-white/40 to-slate-100/60',
        'dark:from-slate-800/60 dark:via-slate-800/40 dark:to-slate-900/60',
        'backdrop-blur-xl backdrop-saturate-150',
        'border border-white/40 dark:border-white/5',
        'shadow-[0_8px_32px_rgba(0,0,0,0.06),inset_0_1px_0_rgba(255,255,255,0.6)]',
        'dark:shadow-[0_8px_32px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.05)]'
      ),
      elevated: cn(
        // Elevated glassmorphism
        'bg-white/70 dark:bg-slate-800/70',
        'backdrop-blur-xl',
        'border border-white/60 dark:border-slate-700/40',
        'shadow-[0_20px_50px_-12px_rgba(0,0,0,0.15),0_0_0_1px_rgba(255,255,255,0.5)]',
        'dark:shadow-[0_20px_50px_-12px_rgba(0,0,0,0.5),0_0_0_1px_rgba(255,255,255,0.05)]'
      ),
      neumorph: cn(
        // Full neumorphism - raised effect
        'bg-slate-100 dark:bg-slate-800',
        'shadow-[8px_8px_16px_rgba(174,184,194,0.5),-8px_-8px_16px_rgba(255,255,255,0.8)]',
        'dark:shadow-[8px_8px_16px_rgba(0,0,0,0.5),-8px_-8px_16px_rgba(60,70,85,0.3)]',
        'border-none'
      ),
      'neumorph-inset': cn(
        // Inset neumorphism - pressed effect
        'bg-slate-100 dark:bg-slate-800',
        'shadow-[inset_4px_4px_8px_rgba(174,184,194,0.4),inset_-4px_-4px_8px_rgba(255,255,255,0.7)]',
        'dark:shadow-[inset_4px_4px_8px_rgba(0,0,0,0.4),inset_-4px_-4px_8px_rgba(60,70,85,0.2)]',
        'border-none'
      ),
    };

    const paddingStyles = {
      none: '',
      sm: 'p-3 sm:p-4',
      md: 'p-4 sm:p-5',
      lg: 'p-5 sm:p-6',
    };

    const glowStyles = {
      none: '',
      blue: 'shadow-[0_0_40px_-8px_rgba(59,130,246,0.3)] dark:shadow-[0_0_40px_-8px_rgba(59,130,246,0.4)]',
      purple: 'shadow-[0_0_40px_-8px_rgba(139,92,246,0.3)] dark:shadow-[0_0_40px_-8px_rgba(139,92,246,0.4)]',
      amber: 'shadow-[0_0_40px_-8px_rgba(245,158,11,0.3)] dark:shadow-[0_0_40px_-8px_rgba(245,158,11,0.4)]',
    };

    const hoverStyles = hover
      ? cn(
          'transition-all duration-300 cursor-pointer',
          'hover:-translate-y-1',
          'hover:shadow-[0_25px_60px_-12px_rgba(0,0,0,0.2),0_0_0_1px_rgba(255,255,255,0.6)]',
          'dark:hover:shadow-[0_25px_60px_-12px_rgba(0,0,0,0.6),0_0_0_1px_rgba(255,255,255,0.05)]'
        )
      : 'transition-all duration-200';

    return (
      <div
        ref={ref}
        className={cn(
          'rounded-3xl',
          variantStyles[variant],
          paddingStyles[padding],
          glowStyles[glow],
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
        'text-slate-600 dark:text-slate-300',
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
