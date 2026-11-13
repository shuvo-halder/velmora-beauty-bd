import React from 'react';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?:
    | 'primary'
    | 'secondary'
    | 'success'
    | 'warning'
    | 'error'
    | 'info'
    | 'outline'
    | 'deal'
    | 'sale'
    | 'new';
  size?: 'sm' | 'md' | 'lg';
  leftIcon?: React.ReactNode;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  leftIcon,
  className = '',
  ...props
}) => {
  const sizeClasses = {
    sm: 'text-[10px] px-2 py-0.5 rounded-md font-medium',
    md: 'text-xs px-2.5 py-1 rounded-md font-semibold',
    lg: 'text-sm px-3 py-1.5 rounded-lg font-semibold',
  };

  const variantClasses = {
    primary: 'bg-primary text-white font-semibold',
    secondary: 'bg-ink text-white font-semibold',
    accent: 'bg-primary text-white font-semibold',
    success: 'bg-emerald-50 text-[#16A34A] border border-emerald-200 font-semibold',
    warning: 'bg-amber-50 text-[#D97706] border border-amber-200 font-semibold',
    error: 'bg-red-50 text-[#DC2626] border border-red-200 font-semibold',
    info: 'bg-sky-50 text-sky-700 border border-sky-200 font-semibold',
    outline: 'bg-white text-muted border border-champagne/50 font-semibold',
    deal: 'bg-sale text-sale-text font-bold',
    sale: 'bg-sale text-sale-text font-bold',
    new: 'bg-beige text-ink font-bold border border-beige',
  };

  return (
    <span
      className={`inline-flex items-center gap-1 leading-none ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
      {...props}
    >
      {leftIcon}
      <span>{children}</span>
    </span>
  );
};
