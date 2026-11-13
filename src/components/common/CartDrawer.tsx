'use client';

import React, { useState, useEffect } from 'react';
import { useStorefront } from '../../context/StorefrontContext';
import { useCart } from '../../hooks/useCart';
import { 
  X, 
  ShoppingBag, 
  ArrowRight, 
  Tag, 
  Truck, 
  Sparkles,
  ShieldCheck,
  Loader2,
  Trash2
} from 'lucide-react';
import { CartItem } from '../cart/CartItem';
import { formatPrice } from '../../utils/formatters';

export const CartDrawer: React.FC = () => {
  const { 
    isCartOpen, 
    setIsCartOpen, 
    navigateTo,
    publicSettings
  } = useStorefront();

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

  const [couponInput, setCouponInput] = useState('');
  const trackedDrawerKeyRef = React.useRef<string | null>(null);

  const currencyCode = publicSettings?.general?.currency || 'BDT';
  const currencySymbol = publicSettings?.general?.currencySymbol || (currencyCode === 'BDT' ? '৳' : '৳');

  // GA4 Tracking when drawer opens
  useEffect(() => {
    if (isCartOpen && cart.items.length > 0) {
      const cartKey = `drawer_${cart.items.map(i => `${i.id}_${i.quantity}`).join(',')}_${cart.total}`;
      if (trackedDrawerKeyRef.current !== cartKey) {
        trackedDrawerKeyRef.current = cartKey;
        viewCartGA4();
      }
    } else if (!isCartOpen) {
      trackedDrawerKeyRef.current = null;
    }
  }, [isCartOpen, cart.items, cart.total]);

  if (!isCartOpen) return null;

  const freeShippingGoal = publicSettings?.shipping?.freeShippingThreshold ?? 3000;
  const currentSubtotal = cart.subtotal;
  const amountNeeded = Math.max(0, freeShippingGoal - currentSubtotal);
  const shippingPercent = freeShippingGoal > 0 ? Math.min(100, Math.round((currentSubtotal / freeShippingGoal) * 100)) : 100;
  
  const isFreeShipping = currentSubtotal >= freeShippingGoal || (cart.shippingFee !== undefined && cart.shippingFee === 0);
  const netSubtotal = Math.max(0, currentSubtotal - cart.discount);

  const rawTaxRate = publicSettings?.tax?.enableTax || publicSettings?.tax?.taxEnabled
    ? (publicSettings?.tax?.taxRate ?? publicSettings?.tax?.defaultTaxRate ?? 0)
    : 0;
  const taxFraction = rawTaxRate > 1 ? rawTaxRate / 100 : rawTaxRate;
  const taxPercentDisplay = Math.round(taxFraction * 100);

  const calculatedTax = cart.estimatedTax !== undefined ? cart.estimatedTax : (netSubtotal * taxFraction);
  const estimatedTotal = cart.total > 0 ? cart.total : (netSubtotal + (isFreeShipping ? 0 : (cart.shippingFee || 0)) + calculatedTax);

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponInput.trim()) return;
    try {
      await applyCoupon(couponInput);
      setCouponInput('');
    } catch (err) {
      // Error handled by hook
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity duration-300"
        onClick={() => setIsCartOpen(false)}
      />

      {/* Drawer */}
      <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col z-10 animate-in slide-in-from-right duration-250">
        
        {/* Header */}
        <div className="p-4 border-b border-champagne/50 flex items-center justify-between bg-[#F9FAFB]">
          <div className="flex items-center gap-2">
            <ShoppingBag className="text-primary" size={18} />
            <h3 className="font-bold text-base text-ink">
              Shopping Cart ({totalItemCount})
            </h3>
          </div>
          <div className="flex items-center gap-1.5">
            {cart.items.length > 0 && (
              <button
                onClick={() => {
                  if (confirm('Are you sure you want to clear your cart?')) {
                    clearCart();
                  }
                }}
                disabled={isClearingCart}
                className="p-1.5 text-taupe hover:text-primary hover:bg-sage/30 rounded-lg transition-colors cursor-pointer"
                title="Clear Entire Cart"
              >
                {isClearingCart ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
              </button>
            )}
            <button
              onClick={() => setIsCartOpen(false)}
              className="p-1.5 text-taupe hover:text-ink hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Free Shipping Progress Indicator */}
        <div className="p-3.5 bg-sage/30 border-b border-primary/15">
          <div className="flex items-center justify-between text-xs font-medium mb-1.5">
            <span className="flex items-center gap-1.5 text-ink">
              <Truck size={14} className="text-primary" />
              {amountNeeded > 0 ? (
                <>Add <span className="font-bold text-primary">{formatPrice(amountNeeded, currencyCode, currencySymbol)}</span> more for FREE Shipping</>
              ) : (
                <span className="text-[#16A34A] font-semibold flex items-center gap-1">
                  <Sparkles size={14} /> You unlocked FREE Shipping!
                </span>
              )}
            </span>
            <span className="text-taupe text-xs font-mono">{shippingPercent}%</span>
          </div>
          <div className="w-full h-1.5 bg-[#E5E7EB] rounded-full overflow-hidden">
            <div 
              className={`h-full transition-all duration-300 ${amountNeeded === 0 ? 'bg-[#16A34A]' : 'bg-primary'}`}
              style={{ width: `${shippingPercent}%` }}
            />
          </div>
        </div>

        {/* Items List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2 divide-y divide-champagne/50">
          {isLoading ? (
            <div className="h-full flex flex-col items-center justify-center py-12 text-taupe">
              <Loader2 size={28} className="animate-spin text-primary mb-2" />
              <p className="text-xs font-semibold">Synchronizing cart...</p>
            </div>
          ) : cart.items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center py-12 px-4 space-y-3">
              <div className="w-14 h-14 rounded-full bg-[#F9FAFB] border border-champagne/50 flex items-center justify-center text-taupe">
                <ShoppingBag size={24} />
              </div>
              <div>
                <h4 className="font-bold text-ink text-base">Your cart is empty</h4>
                <p className="text-xs text-taupe mt-1 max-w-xs">
                  Discover quality products and add items to your cart.
                </p>
              </div>
              <button
                onClick={() => {
                  setIsCartOpen(false);
                  navigateTo('shop');
                }}
                className="px-4 py-2 bg-primary hover:bg-primary-hover text-white font-semibold text-xs rounded-lg transition-colors cursor-pointer shadow-xs"
              >
                Browse Catalog
              </button>
            </div>
          ) : (
            cart.items.map((item) => (
              <CartItem 
                key={item.id} 
                item={item} 
                onUpdateQuantity={updateCartQuantity}
                onRemove={removeCartItem}
                isUpdating={isUpdatingQuantity}
                isRemoving={isRemovingItem}
                onNavigateToProduct={(slug) => {
                  setIsCartOpen(false);
                  navigateTo('product-detail', { productSlug: slug });
                }}
              />
            ))
          )}
        </div>

        {/* Footer Summary & Checkout */}
        {cart.items.length > 0 && (
          <div className="p-4 bg-[#F9FAFB] border-t border-champagne/50 space-y-3">
            
            {/* Coupon Code input */}
            <form onSubmit={handleApplyCoupon} className="space-y-1">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <input
                    type="text"
                    placeholder="e.g. MONSOON-5"
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value)}
                    className="w-full py-2 pl-8 pr-3 bg-white border border-champagne/50 rounded-lg text-xs uppercase placeholder:normal-case font-medium text-ink focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                  />
                  <Tag size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-taupe" />
                </div>
                <button
                  type="submit"
                  disabled={isApplyingCoupon || !couponInput.trim()}
                  className="px-3.5 py-2 bg-ink hover:bg-black text-white font-semibold text-xs rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                >
                  {isApplyingCoupon ? <Loader2 size={13} className="animate-spin" /> : 'Apply'}
                </button>
              </div>

              {availableCoupons && availableCoupons.length > 0 && !cart.appliedCoupon && (
                <div className="pt-1">
                  <div className="flex flex-wrap gap-1">
                    {availableCoupons.map((c) => (
                      <button
                        key={c.code}
                        type="button"
                        onClick={() => {
                          setCouponInput(c.code);
                          applyCoupon(c.code);
                        }}
                        className="inline-flex items-center gap-1 text-[10px] font-semibold bg-[#F3F4F6] hover:bg-[#E5E7EB] text-ink px-1.5 py-0.5 rounded border border-champagne/50 cursor-pointer"
                      >
                        <Tag size={9} className="text-primary" />
                        {c.code}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {applyCouponError && (
                <p className="text-[11px] text-[#DC2626] font-medium">{(applyCouponError as any).message || 'Invalid coupon'}</p>
              )}
            </form>

            {/* Calculations Breakdown */}
            <div className="space-y-1.5 text-xs text-taupe pt-1 border-t border-champagne/50">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-semibold text-ink">{formatPrice(cart.subtotal, currencyCode, currencySymbol)}</span>
              </div>
              {(cart.discount > 0 || cart.appliedCoupon) && (
                <div className="flex justify-between items-center text-primary font-medium bg-sage/30 px-2 py-1 rounded border border-primary/20">
                  <span className="flex items-center gap-1">
                    <Tag size={11} />
                    Discount ({cart.appliedCoupon || 'Applied'})
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span>-{formatPrice(cart.discount, currencyCode, currencySymbol)}</span>
                    <button
                      type="button"
                      onClick={() => removeCoupon()}
                      disabled={isRemovingCoupon}
                      title="Remove coupon"
                      className="p-0.5 text-primary hover:text-black rounded transition-colors cursor-pointer"
                    >
                      {isRemovingCoupon ? <Loader2 size={11} className="animate-spin" /> : <X size={11} />}
                    </button>
                  </div>
                </div>
              )}
              <div className="flex justify-between">
                <span>Shipping</span>
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
              <div className="flex justify-between text-sm font-bold text-ink pt-2 border-t border-champagne/50">
                <span>Total Amount</span>
                <span className="text-primary font-bold">{formatPrice(estimatedTotal, currencyCode, currencySymbol)}</span>
              </div>
            </div>

            {/* Checkout Action Buttons */}
            <div className="space-y-2 pt-1">
              <button
                onClick={() => {
                  setIsCartOpen(false);
                  navigateTo('checkout');
                }}
                className="w-full py-2.5 px-4 bg-primary hover:bg-primary-hover text-white font-semibold text-xs uppercase tracking-wider rounded-lg shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight size={14} />
              </button>

              <button
                onClick={() => {
                  setIsCartOpen(false);
                  navigateTo('cart');
                }}
                className="w-full py-2 px-4 bg-white hover:bg-gray-50 text-ink border border-champagne/50 font-semibold text-xs rounded-lg transition-colors cursor-pointer text-center"
              >
                View Cart
              </button>
            </div>

            <div className="text-[11px] text-taupe text-center flex items-center justify-center gap-1">
              <ShieldCheck size={13} className="text-[#16A34A]" />
              <span>Guaranteed safe & secure checkout</span>
            </div>

          </div>
        )}

      </div>
    </div>
  );
};
