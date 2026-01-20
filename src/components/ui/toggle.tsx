'use client';

import { cn } from '@/lib/utils';
import { forwardRef, ButtonHTMLAttributes } from 'react';

interface ToggleOption<T extends string> {
  value: T;
  label: string;
  icon?: React.ReactNode;
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
    sm: 'p-0.5 text-xs',
    md: 'p-1 text-sm',
  };

  const buttonSizeStyles = {
    sm: 'px-2 py-1',
    md: 'px-3 py-1.5',
  };

  return (
    <div
      className={cn(
        'inline-flex rounded-xl bg-slate-100 dark:bg-slate-800',
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
            'inline-flex items-center justify-center gap-1.5 rounded-lg font-medium',
            'transition-all duration-200',
            buttonSizeStyles[size],
            value === option.value
              ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
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
          'relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full',
          'transition-colors duration-200 ease-in-out',
          'focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2',
          checked ? 'bg-blue-500' : 'bg-slate-200 dark:bg-slate-700',
          className
        )}
        {...props}
      >
        <span
          className={cn(
            'pointer-events-none inline-block h-5 w-5 transform rounded-full',
            'bg-white shadow-lg ring-0',
            'transition duration-200 ease-in-out',
            checked ? 'translate-x-5' : 'translate-x-0.5',
            'mt-0.5'
          )}
        />
      </button>
    );
  }
);

Switch.displayName = 'Switch';

