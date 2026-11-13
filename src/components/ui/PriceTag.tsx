import React from 'react';
import { formatPrice } from '../../utils/formatters';

export interface PriceTagProps {
  price: number;
  compareAtPrice?: number;
  discountPercent?: number;
  currencySymbol?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showBadge?: boolean;
  align?: 'left' | 'center' | 'right';
  className?: string;
}

export const PriceTag: React.FC<PriceTagProps> = ({
  price,
  compareAtPrice,
  discountPercent,
  currencySymbol = '৳',
  size = 'md',
  showBadge = true,
  align = 'left',
  className = '',
}) => {
  const sizeMap = {
    sm: {
      current: 'text-sm font-bold text-ink',
      original: 'text-xs text-muted line-through',
      badge: 'text-[10px] px-1.5 py-0.5 bg-sale text-sale-text border border-sale rounded font-bold',
    },
    md: {
      current: 'text-base font-bold text-ink',
      original: 'text-xs text-muted line-through',
      badge: 'text-[10px] px-2 py-0.5 bg-sale text-sale-text border border-sale rounded font-bold',
    },
    lg: {
      current: 'text-xl sm:text-2xl font-bold text-ink',
      original: 'text-sm text-muted line-through',
      badge: 'text-xs px-2.5 py-0.5 bg-sale text-sale-text border border-sale rounded font-bold',
    },
    xl: {
      current: 'text-3xl sm:text-4xl font-bold text-ink tracking-tight',
      original: 'text-lg text-muted line-through',
      badge: 'text-xs px-3 py-1 bg-sale text-sale-text border border-sale rounded font-bold',
    },
  };

  const currentStyles = sizeMap[size];
  const alignClasses = {
    left: 'items-baseline justify-start',
    center: 'items-baseline justify-center',
    right: 'items-baseline justify-end',
  };

  const computedDiscount =
    discountPercent ||
    (compareAtPrice && compareAtPrice > price
      ? Math.round(((compareAtPrice - price) / compareAtPrice) * 100)
      : undefined);

  return (
    <div className={`flex flex-wrap gap-2 ${alignClasses[align]} ${className}`}>
      <span className={currentStyles.current}>
        {formatPrice(price, 'BDT', currencySymbol)}
      </span>

      {compareAtPrice && compareAtPrice > price && (
        <span className={currentStyles.original}>
          {formatPrice(compareAtPrice, 'BDT', currencySymbol)}
        </span>
      )}

      {showBadge && computedDiscount && computedDiscount > 0 && (
        <span className={currentStyles.badge}>
          -{computedDiscount}%
        </span>
      )}
    </div>
  );
};
