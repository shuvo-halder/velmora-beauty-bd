import React from 'react';
import { getOrderStatusMeta, getPaymentStatusMeta } from '../../utils/trackingStatus';

export interface OrderStatusBadgeProps {
  status?: string | null;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
  className?: string;
}

export const OrderStatusBadge: React.FC<OrderStatusBadgeProps> = ({
  status,
  size = 'md',
  showIcon = true,
  className = '',
}) => {
  const meta = getOrderStatusMeta(status);
  const Icon = meta.icon;

  const sizeStyles = {
    sm: 'text-xs px-2.5 py-1 gap-1.5',
    md: 'text-sm px-3 py-1.5 gap-2',
    lg: 'text-sm sm:text-base font-semibold px-3.5 py-2 gap-2',
  }[size];

  const iconSizes = {
    sm: 'w-3.5 h-3.5 shrink-0',
    md: 'w-4 h-4 shrink-0',
    lg: 'w-4 sm:w-5 h-4 sm:h-5 shrink-0',
  }[size];

  return (
    <span
      className={`inline-flex items-center rounded-full font-medium border transition-colors ${meta.classes} ${sizeStyles} ${className}`.trim()}
    >
      {showIcon && Icon && <Icon className={iconSizes} />}
      <span className="leading-none">{meta.label}</span>
    </span>
  );
};

export interface PaymentStatusBadgeProps {
  status?: string | null;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
  className?: string;
}

export const PaymentStatusBadge: React.FC<PaymentStatusBadgeProps> = ({
  status,
  size = 'sm',
  showIcon = true,
  className = '',
}) => {
  const meta = getPaymentStatusMeta(status || undefined);
  const Icon = meta.icon;

  const sizeStyles = {
    sm: 'text-xs px-2.5 py-1 gap-1.5',
    md: 'text-sm px-3 py-1.5 gap-2',
    lg: 'text-sm sm:text-base font-semibold px-3.5 py-2 gap-2',
  }[size];

  const iconSizes = {
    sm: 'w-3.5 h-3.5 shrink-0',
    md: 'w-4 h-4 shrink-0',
    lg: 'w-4 sm:w-5 h-4 sm:h-5 shrink-0',
  }[size];

  return (
    <span
      className={`inline-flex items-center rounded-full font-medium border transition-colors ${meta.badgeClass} ${sizeStyles} ${className}`.trim()}
    >
      {showIcon && Icon && <Icon className={iconSizes} />}
      <span className="leading-none">{meta.label}</span>
    </span>
  );
};

export default OrderStatusBadge;
