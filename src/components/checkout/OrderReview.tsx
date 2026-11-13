import React from 'react';
import { Cart } from '../../types/storefront';
import { CheckoutFormData } from '../../types/checkout';
import { ShoppingBag, MapPin, Wallet } from 'lucide-react';
import { formatPrice } from '../../utils/formatters';

interface OrderReviewProps {
  cart: Cart;
  formData: CheckoutFormData;
}

export const OrderReview: React.FC<OrderReviewProps> = ({ cart, formData }) => {
  return (
    <div className="space-y-5">
      <h3 className="text-base font-bold text-ink">Review Your Order</h3>
      
      {/* Items */}
      <div className="bg-[#F9FAFB] rounded-lg p-4 border border-champagne/50">
        <div className="flex items-center gap-2 mb-3 pb-2 border-b border-champagne/50">
          <ShoppingBag size={15} className="text-primary" />
          <span className="text-xs font-bold text-ink">Order Items ({cart.items.length})</span>
        </div>
        <div className="space-y-2.5">
          {cart.items.map((item) => (
            <div key={item.id} className="flex justify-between items-center text-xs">
              <span className="text-taupe font-medium truncate max-w-[240px]">
                {item.product.name} <span className="text-ink font-semibold">× {item.quantity}</span>
              </span>
              <span className="font-semibold text-ink">{formatPrice(item.totalPrice)}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        {/* Shipping Info */}
        <div className="bg-white border border-champagne/50 p-4 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <MapPin size={14} className="text-primary" />
            <span className="text-xs font-bold text-ink">Delivery Address</span>
          </div>
          <div className="text-xs text-taupe leading-relaxed">
            <div className="text-ink font-semibold mb-0.5">{formData.shippingAddress.fullName}</div>
            <div>{formData.shippingAddress.addressLine1}</div>
            <div>{formData.shippingAddress.city}, {formData.shippingAddress.state} {formData.shippingAddress.postalCode}</div>
            <div>{formData.shippingAddress.country}</div>
          </div>
        </div>

        {/* Payment & Method */}
        <div className="bg-white border border-champagne/50 p-4 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Wallet size={14} className="text-primary" />
            <span className="text-xs font-bold text-ink">Payment & Method</span>
          </div>
          <div className="text-xs text-taupe space-y-1">
            <div className="flex justify-between">
              <span>Payment:</span>
              <span className="text-ink font-semibold uppercase">{formData.paymentMethod}</span>
            </div>
            <div className="flex justify-between">
              <span>Shipping:</span>
              <span className="text-ink font-semibold uppercase">{formData.shippingMethod}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Totals */}
      <div className="bg-ink text-white p-5 rounded-lg space-y-2.5">
        <div className="flex justify-between text-xs text-gray-300">
          <span>Subtotal</span>
          <span className="font-semibold text-white">{formatPrice(cart.subtotal)}</span>
        </div>
        {cart.discount > 0 && (
          <div className="flex justify-between text-xs text-emerald-400">
            <span>Discount ({cart.appliedCoupon})</span>
            <span className="font-semibold">-{formatPrice(cart.discount)}</span>
          </div>
        )}
        <div className="flex justify-between text-xs text-gray-300">
          <span>Shipping</span>
          <span className="font-semibold text-white">
            {cart.shippingFee === 0 ? 'FREE' : cart.shippingFee ? formatPrice(cart.shippingFee) : 'Calculated at checkout'}
          </span>
        </div>
        <div className="flex justify-between text-xs text-gray-300">
          <span>Tax</span>
          <span className="font-semibold text-white">{formatPrice(cart.estimatedTax)}</span>
        </div>
        <div className="flex justify-between text-base font-bold pt-3 border-t border-gray-700">
          <span>Total</span>
          <span className="text-primary">{formatPrice(cart.total)}</span>
        </div>
      </div>
    </div>
  );
};
