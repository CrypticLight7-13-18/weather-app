'use client';

import { cn } from '@/lib/utils';
import { forwardRef, ButtonHTMLAttributes, ReactNode } from 'react';

interface ToggleOption<T extends string> {
  value: T;
  label: ReactNode;
  icon?: ReactNode;
}

interface ToggleProps<T extends string> {
  options: ToggleOption<T>[];
  value: T;
  onChange: (value: T) => void;
  className?: string;
  size?: 'sm' | 'md';
}

export function Toggle<T extends string>({
  options,
  value,
  onChange,
  className,
  size = 'md',
}: ToggleProps<T>) {
  const sizeStyles = {
    sm: 'p-1 text-xs',
    md: 'p-1.5 text-sm',
  };

  const buttonSizeStyles = {
    sm: 'px-2.5 py-1',
    md: 'px-3 py-1.5',
  };

  return (
    <div
      className={cn(
        'inline-flex rounded-2xl',
        // Neumorphic inset container
        'bg-slate-100/80 dark:bg-slate-800/80',
        'shadow-[inset_2px_2px_4px_rgba(174,184,194,0.4),inset_-2px_-2px_4px_rgba(255,255,255,0.8)]',
        'dark:shadow-[inset_2px_2px_4px_rgba(0,0,0,0.4),inset_-2px_-2px_4px_rgba(60,70,85,0.3)]',
        'border border-white/30 dark:border-white/5',
        sizeStyles[size],
        className
      )}
      role="group"
    >
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => onChange(option.value)}
          className={cn(
            'inline-flex items-center justify-center gap-1.5 rounded-xl font-medium',
            'transition-all duration-200',
            buttonSizeStyles[size],
            value === option.value
              ? cn(
                  // Neumorphic raised button
                  'bg-white dark:bg-slate-700',
                  'text-slate-800 dark:text-white',
                  'shadow-[2px_2px_4px_rgba(174,184,194,0.3),-2px_-2px_4px_rgba(255,255,255,0.8)]',
                  'dark:shadow-[2px_2px_4px_rgba(0,0,0,0.3),-2px_-2px_4px_rgba(60,70,85,0.2)]',
                  'border border-white/60 dark:border-white/10'
                )
              : cn(
                  'text-slate-500 dark:text-slate-400',
                  'hover:text-slate-700 dark:hover:text-slate-200'
                )
          )}
          aria-pressed={value === option.value}
        >
          {option.icon}
          {option.label}
        </button>
      ))}
    </div>
  );
}

// Switch component for boolean toggles
interface SwitchProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'onChange'> {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
}

export const Switch = forwardRef<HTMLButtonElement, SwitchProps>(
  ({ checked, onChange, label, className, ...props }, ref) => {
    return (
      <button
        ref={ref}
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        onClick={() => onChange(!checked)}
        className={cn(
          'relative inline-flex h-7 w-12 shrink-0 cursor-pointer rounded-full',
          'transition-all duration-300 ease-in-out',
          'focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2',
          'dark:focus-visible:ring-offset-slate-900',
          // Neumorphic style
          checked 
            ? cn(
                'bg-gradient-to-r from-blue-500 to-cyan-500',
                'shadow-[inset_0_2px_4px_rgba(0,0,0,0.1),0_0_20px_rgba(59,130,246,0.3)]'
              )
            : cn(
                'bg-slate-200 dark:bg-slate-700',
                'shadow-[inset_2px_2px_4px_rgba(174,184,194,0.4),inset_-2px_-2px_4px_rgba(255,255,255,0.6)]',
                'dark:shadow-[inset_2px_2px_4px_rgba(0,0,0,0.4),inset_-2px_-2px_4px_rgba(60,70,85,0.2)]'
              ),
          className
        )}
        {...props}
      >
        <span
          className={cn(
            'pointer-events-none inline-block h-5 w-5 transform rounded-full',
            'bg-white ring-0',
            'transition-all duration-300 ease-in-out',
            'shadow-[2px_2px_4px_rgba(0,0,0,0.15)]',
            checked ? 'translate-x-6' : 'translate-x-1',
            'mt-1'
          )}
        />
      </button>
    );
  }
);

Switch.displayName = 'Switch';
