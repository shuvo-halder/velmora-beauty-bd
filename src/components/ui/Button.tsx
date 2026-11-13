import React from 'react';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'accent' | 'subtle';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      leftIcon,
      rightIcon,
      fullWidth = false,
      className = '',
      disabled,
      type = 'button',
      ...props
    },
    ref
  ) => {
    // Base classes
    const baseClasses =
      'inline-flex items-center justify-center font-bold transition-all duration-200 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed select-none active:scale-[0.98]';

    // Size variants
    const sizeClasses = {
      sm: 'text-xs px-3 py-1.5 rounded-lg gap-1.5 font-medium',
      md: 'text-xs sm:text-sm px-4 py-2.5 rounded-lg gap-2 font-semibold',
      lg: 'text-sm sm:text-base px-6 py-3 rounded-lg gap-2.5 font-semibold',
      icon: 'p-2.5 rounded-lg justify-center',
    };

    // Style variants
    const variantClasses = {
      primary:
        'bg-primary hover:bg-primary-hover text-white shadow-xs focus:ring-2 focus:ring-primary/20',
      secondary:
        'bg-ink hover:bg-[#1f2937] text-white shadow-xs focus:ring-2 focus:ring-[#111827]/20',
      accent:
        'bg-primary hover:bg-primary-hover text-white shadow-xs focus:ring-2 focus:ring-primary/20',
      outline:
        'bg-white hover:bg-[#F9FAFB] text-ink border border-champagne/50 hover:border-champagne focus:ring-2 focus:ring-primary/20',
      ghost:
        'bg-transparent hover:bg-[#F9FAFB] text-ink hover:text-primary focus:ring-2 focus:ring-gray-100',
      danger:
        'bg-[#DC2626] hover:bg-[#B91C1C] text-white shadow-xs focus:ring-2 focus:ring-[#DC2626]/20',
      subtle:
        'bg-sage/30 hover:bg-rose-100 text-primary font-semibold focus:ring-2 focus:ring-primary/20',
    };

    const widthClass = fullWidth ? 'w-full' : '';

    return (
      <button
        ref={ref}
        type={type}
        disabled={disabled || isLoading}
        className={`${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${widthClass} ${className}`}
        {...props}
      >
        {isLoading ? (
          <Loader2 className="animate-spin" size={size === 'sm' ? 14 : size === 'lg' ? 20 : 16} />
        ) : (
          leftIcon
        )}
        {children && <span>{children}</span>}
        {!isLoading && rightIcon}
      </button>
    );
  }
);

Button.displayName = 'Button';
