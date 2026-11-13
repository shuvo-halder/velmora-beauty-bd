import React from 'react';
import { Minus, Plus, Loader2 } from 'lucide-react';

interface QuantitySelectorProps {
  quantity: number;
  onUpdate: (newQuantity: number) => void;
  isLoading?: boolean;
  min?: number;
  max?: number;
  size?: 'sm' | 'md';
}

export const QuantitySelector: React.FC<QuantitySelectorProps> = ({
  quantity,
  onUpdate,
  isLoading = false,
  min = 1,
  max = 99,
  size = 'md'
}) => {
  const padding = size === 'sm' ? 'p-1' : 'p-2';
  const textClass = size === 'sm' ? 'px-2 text-xs' : 'px-3 text-sm';

  return (
    <div className="flex items-center border border-champagne/50 rounded-lg bg-[#F9FAFB] overflow-hidden">
      <button
        onClick={() => onUpdate(Math.max(min, quantity - 1))}
        disabled={isLoading || quantity <= min}
        className={`${padding} text-ink hover:bg-gray-200 disabled:opacity-40 transition-colors font-semibold cursor-pointer`}
        aria-label="Decrease quantity"
      >
        <Minus size={size === 'sm' ? 12 : 14} />
      </button>
      
      <div className={`${textClass} font-semibold text-ink min-w-[30px] text-center flex items-center justify-center`}>
        {isLoading ? (
          <Loader2 size={12} className="animate-spin text-primary" />
        ) : (
          <span>{quantity}</span>
        )}
      </div>

      <button
        onClick={() => onUpdate(Math.min(max, quantity + 1))}
        disabled={isLoading || quantity >= max}
        className={`${padding} text-ink hover:bg-gray-200 disabled:opacity-40 transition-colors font-semibold cursor-pointer`}
        aria-label="Increase quantity"
      >
        <Plus size={size === 'sm' ? 12 : 14} />
      </button>
    </div>
  );
};
