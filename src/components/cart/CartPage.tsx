'use client';

import React, { useEffect } from 'react';
import { useStorefront } from '../../context/StorefrontContext';
import { useCart } from '../../hooks/useCart';
import { 
  ShoppingBag, 
  ArrowRight, 
  Tag, 
  ShieldCheck, 
  ArrowLeft,
  Loader2,
  Trash2,
  X
} from 'lucide-react';
import { CartItem } from './CartItem';
import { formatPrice } from '../../utils/formatters';

export const CartPage: React.FC = () => {
  const { navigateTo, publicSettings } = useStorefront();
  const {
    cart,
    isLoading,
    totalItemCount,
    updateCartQuantity,
    removeCartItem,
    clearCart,
    availableCoupons,
    applyCoupon,
    isApplyingCoupon,
    applyCouponError,
    removeCoupon,
    isRemovingCoupon,
    viewCartGA4,
    isUpdatingQuantity,
    isRemovingItem,
    isClearingCart,
    isSessionLoading
  } = useCart();

  const [couponCode, setCouponCode] = React.useState('');
  const trackedPageKeyRef = React.useRef<string | null>(null);

  const currencyCode = publicSettings?.general?.currency || 'BDT';
  const currencySymbol = publicSettings?.general?.currencySymbol || (currencyCode === 'BDT' ? '৳' : '৳');
  const freeShippingGoal = publicSettings?.shipping?.freeShippingThreshold ?? 3000;
  const isFreeShipping = cart.subtotal >= freeShippingGoal || (cart.shippingFee !== undefined && cart.shippingFee === 0);
  const netSubtotal = Math.max(0, cart.subtotal - cart.discount);

  const rawTaxRate = publicSettings?.tax?.enableTax || publicSettings?.tax?.taxEnabled
    ? (publicSettings?.tax?.taxRate ?? publicSettings?.tax?.defaultTaxRate ?? 0)
    : 0;
  const taxFraction = rawTaxRate > 1 ? rawTaxRate / 100 : rawTaxRate;
  const taxPercentDisplay = Math.round(taxFraction * 100);

  const calculatedTax = cart.estimatedTax !== undefined ? cart.estimatedTax : (netSubtotal * taxFraction);
  const estimatedTotal = cart.total > 0 ? cart.total : (netSubtotal + (isFreeShipping ? 0 : (cart.shippingFee || 0)) + calculatedTax);

  // GA4 Tracking
  useEffect(() => {
    if (cart.items.length > 0) {
      const pageKey = `page_${cart.items.map(i => `${i.id}_${i.quantity}`).join(',')}_${cart.total}`;
      if (trackedPageKeyRef.current !== pageKey) {
        trackedPageKeyRef.current = pageKey;
        viewCartGA4();
      }
    }
  }, [cart.items, cart.total]);

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode.trim()) return;
    try {
      await applyCoupon(couponCode);
      setCouponCode('');
    } catch (err) {
      // Error handled by hook
    }
  };

  if (isLoading) {
    return (
      <div className="py-20 bg-bg min-h-screen flex flex-col items-center justify-center">
        <Loader2 size={36} className="animate-spin text-primary mb-3" />
        <h2 className="text-lg font-bold text-ink">Loading your shopping cart...</h2>
      </div>
    );
  }

  if (cart.items.length === 0) {
    return (
      <div className="py-16 bg-bg min-h-screen flex items-center justify-center">
        <div className="max-w-md w-full bg-white border border-champagne/50 rounded-xl p-8 text-center space-y-4 shadow-xs">
          <div className="w-16 h-16 bg-[#F9FAFB] border border-champagne/50 rounded-full flex items-center justify-center text-taupe mx-auto">
            <ShoppingBag size={28} />
          </div>
          <h2 className="text-xl font-bold text-ink">Your Cart is Empty</h2>
          <p className="text-xs text-taupe">
            Browse our catalog to discover quality products and latest arrivals.
          </p>
          <button
            onClick={() => navigateTo('shop')}
            className="px-5 py-2.5 bg-primary hover:bg-primary-hover text-white font-semibold text-xs rounded-lg shadow-xs transition-colors cursor-pointer"
          >
            Explore Catalog
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="py-8 bg-bg min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        
        {/* Title */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-ink tracking-tight">
              Shopping Cart ({totalItemCount} Items)
            </h1>
            <p className="text-xs text-taupe mt-1">
              Review items, apply promo codes, and proceed to checkout.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => {
                if (confirm('Clear entire shopping cart?')) {
                  clearCart();
                }
              }}
              disabled={isClearingCart}
              className="px-3.5 py-2 text-taupe hover:text-primary border border-champagne/50 hover:border-primary/30 bg-white rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              {isClearingCart ? <Loader2 size={13} className="animate-spin" /> : <Trash2 size={13} />}
              <span>Clear Cart</span>
            </button>
            <button
              onClick={() => navigateTo('shop')}
              className="px-3.5 py-2 bg-white border border-champagne/50 text-ink hover:text-primary rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <ArrowLeft size={13} />
              <span>Continue Shopping</span>
            </button>
          </div>
        </div>

        {/* Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Item Table (8 cols) */}
          <div className="lg:col-span-8 bg-white border border-champagne/50 rounded-xl p-5 shadow-xs divide-y divide-champagne/50">
            {cart.items.map((item) => (
              <CartItem 
                key={item.id} 
                item={item} 
                onUpdateQuantity={updateCartQuantity}
                onRemove={removeCartItem}
                isUpdating={isUpdatingQuantity}
                isRemoving={isRemovingItem}
                onNavigateToProduct={(slug) => navigateTo('product-detail', { productSlug: slug })}
              />
            ))}
          </div>

          {/* Order Summary (4 cols) */}
          <div className="lg:col-span-4 bg-white border border-champagne/50 rounded-xl p-5 shadow-xs space-y-5 sticky top-24">
            <h3 className="font-bold text-base text-ink pb-3 border-b border-champagne/50">
              Order Summary
            </h3>

            {/* Coupon Box */}
            <form onSubmit={handleApplyCoupon} className="space-y-1.5">
              <label className="text-xs font-semibold text-ink">Promo Code</label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <input
                    type="text"
                    placeholder="e.g. MONSOON-5"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    className="w-full py-2 px-3 pl-8 bg-white border border-champagne/50 rounded-lg text-xs uppercase font-medium text-ink focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                  />
                  <Tag size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-taupe" />
                </div>
                <button
                  type="submit"
                  disabled={isApplyingCoupon || !couponCode.trim()}
                  className="px-3.5 py-2 bg-ink hover:bg-black text-white font-semibold text-xs rounded-lg transition-colors disabled:opacity-50 cursor-pointer"
                >
                  {isApplyingCoupon ? <Loader2 size={13} className="animate-spin" /> : 'Apply'}
                </button>
              </div>

              {availableCoupons && availableCoupons.length > 0 && !cart.appliedCoupon && (
                <div className="pt-1">
                  <p className="text-[11px] text-taupe mb-1 font-medium">Available Offers:</p>
                  <div className="flex flex-wrap gap-1.5">
                    {availableCoupons.map((c) => (
                      <button
                        key={c.code}
                        type="button"
                        onClick={() => {
                          setCouponCode(c.code);
                          applyCoupon(c.code);
                        }}
                        className="inline-flex items-center gap-1 text-[11px] font-semibold bg-[#F3F4F6] hover:bg-[#E5E7EB] text-ink px-2 py-1 rounded border border-champagne/50 transition-colors cursor-pointer"
                      >
                        <Tag size={10} className="text-primary" />
                        {c.code} {c.minOrderAmount ? `(Min BDT ${c.minOrderAmount})` : ''}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {applyCouponError && (
                <p className="text-[11px] text-[#DC2626] font-medium">
                  {(applyCouponError as any).message || 'Invalid coupon code'}
                </p>
              )}
            </form>

            <div className="space-y-2 text-xs text-taupe border-t border-champagne/50 pt-3.5">
              <div className="flex justify-between">
                <span>Items Subtotal</span>
                <span className="font-semibold text-ink">{formatPrice(cart.subtotal, currencyCode, currencySymbol)}</span>
              </div>
              {(cart.discount > 0 || cart.appliedCoupon) && (
                <div className="flex items-center justify-between text-primary font-medium bg-sage/30 px-2 py-1.5 rounded-md border border-primary/20">
                  <span className="flex items-center gap-1">
                    <Tag size={12} />
                    Coupon ({cart.appliedCoupon || 'Applied'})
                  </span>
                  <div className="flex items-center gap-2">
                    <span>-{formatPrice(cart.discount, currencyCode, currencySymbol)}</span>
                    <button
                      type="button"
                      onClick={() => removeCoupon()}
                      disabled={isRemovingCoupon}
                      title="Remove coupon"
                      className="p-0.5 text-primary hover:text-black rounded transition-colors cursor-pointer"
                    >
                      {isRemovingCoupon ? <Loader2 size={12} className="animate-spin" /> : <X size={12} />}
                    </button>
                  </div>
                </div>
              )}
              <div className="flex justify-between">
                <span>Shipping Fee</span>
                <span className="font-semibold text-ink">
                  {isSessionLoading && cart.shippingFee === undefined ? (
                    <span className="text-taupe font-normal text-xs flex items-center gap-1 justify-end">
                      <Loader2 size={12} className="animate-spin text-primary" /> Calculating...
                    </span>
                  ) : isFreeShipping ? (
                    <span className="text-[#16A34A] font-semibold">FREE</span>
                  ) : cart.shippingFee !== undefined && cart.shippingFee > 0 ? (
                    formatPrice(cart.shippingFee, currencyCode, currencySymbol)
                  ) : (
                    <span className="text-taupe font-normal text-xs">Calculated at checkout</span>
                  )}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Estimated Tax ({taxPercentDisplay}%)</span>
                <span className="font-semibold text-ink">{formatPrice(calculatedTax, currencyCode, currencySymbol)}</span>
              </div>
              <div className="flex justify-between text-base font-bold text-ink pt-2.5 border-t border-champagne/50">
                <span>Total Amount</span>
                <span className="text-primary font-bold">{formatPrice(estimatedTotal, currencyCode, currencySymbol)}</span>
              </div>
            </div>

            <button
              onClick={() => navigateTo('checkout')}
              className="w-full py-3 bg-primary hover:bg-primary-hover text-white font-semibold text-xs uppercase tracking-wider rounded-lg shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight size={15} />
            </button>

            <div className="text-[11px] text-taupe text-center flex items-center justify-center gap-1">
              <ShieldCheck size={13} className="text-[#16A34A]" />
              <span>Guaranteed safe & secure checkout</span>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
