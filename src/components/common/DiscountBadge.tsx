'use client';

import React from 'react';
import { getDiscountInfo, DiscountInfo, DiscountableProduct, DiscountableVariant } from '../../utils/discount';

export interface DiscountBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  product?: DiscountableProduct | null;
  variant?: DiscountableVariant | null;
  discountInfo?: DiscountInfo;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  format?: 'percent' | 'percent-off';
  className?: string;
}

export const DiscountBadge: React.FC<DiscountBadgeProps> = ({
  product,
  variant,
  discountInfo: propDiscountInfo,
  size = 'sm',
  format = 'percent',
  className = '',
  ...props
}) => {
  const info = propDiscountInfo || getDiscountInfo(product, variant);

  if (!info.hasDiscount || info.discountPercent < 1) {
    return null;
  }

  const sizeClasses = {
    xs: 'text-[9px] px-1.5 py-0.5 rounded font-bold',
    sm: 'text-[10px] sm:text-xs px-2 py-0.5 rounded-md font-bold',
    md: 'text-xs sm:text-sm px-2.5 py-1 rounded-md font-bold',
    lg: 'text-sm sm:text-base px-3 py-1.5 rounded-lg font-extrabold',
  };

  const text = format === 'percent-off' ? info.detailBadgeText : info.badgeText;

  return (
    <span
      className={`inline-flex items-center justify-center bg-sale text-sale-text leading-none shadow-xs tracking-tight select-none border border-sale ${sizeClasses[size]} ${className}`}
      aria-label={`${info.discountPercent} percent discount`}
      {...props}
    >
      {text}
    </span>
  );
};
