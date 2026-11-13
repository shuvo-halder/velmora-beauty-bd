/**
 * Shared discount computation utility.
 * Ensures consistent discount calculation, badge labels, and savings amounts across the storefront.
 */

export interface DiscountInfo {
  hasDiscount: boolean;
  price: number;
  compareAtPrice?: number;
  discountPercent: number;
  savingsAmount: number;
  badgeText: string;        // e.g. "-25%"
  detailBadgeText: string;  // e.g. "-25% OFF"
}

export interface DiscountableProduct {
  price?: number | null;
  compareAtPrice?: number | null;
  discountPercent?: number | null;
  variants?: Array<{
    price?: number | null;
    compareAtPrice?: number | null;
    discountPercent?: number | null;
  }> | null;
}

export interface DiscountableVariant {
  price?: number | null;
  compareAtPrice?: number | null;
  discountPercent?: number | null;
}

/**
 * Computes discount information for any product and optional active variant.
 * Fallbacks safely to variant compareAtPrice if product-level compareAtPrice is missing.
 * Shows only when compare > price and percent >= 1.
 */
export function getDiscountInfo(
  product?: DiscountableProduct | null,
  variant?: DiscountableVariant | null
): DiscountInfo {
  if (!product) {
    return {
      hasDiscount: false,
      price: 0,
      discountPercent: 0,
      savingsAmount: 0,
      badgeText: '',
      detailBadgeText: '',
    };
  }

  const price = Number(variant?.price ?? product.price ?? 0);

  // Determine compareAtPrice with fallbacks
  let rawCompare: number | undefined;
  if (variant?.compareAtPrice !== undefined && variant.compareAtPrice !== null && !isNaN(Number(variant.compareAtPrice))) {
    rawCompare = Number(variant.compareAtPrice);
  } else if (product.compareAtPrice !== undefined && product.compareAtPrice !== null && !isNaN(Number(product.compareAtPrice))) {
    rawCompare = Number(product.compareAtPrice);
  } else if (Array.isArray(product.variants) && product.variants.length > 0) {
    const firstVariantWithCompare = product.variants.find(
      (v) => v.compareAtPrice !== undefined && v.compareAtPrice !== null && !isNaN(Number(v.compareAtPrice)) && Number(v.compareAtPrice) > price
    );
    if (firstVariantWithCompare?.compareAtPrice) {
      rawCompare = Number(firstVariantWithCompare.compareAtPrice);
    }
  }

  const compareAtPrice = (rawCompare !== undefined && rawCompare > price) ? rawCompare : undefined;

  let discountPercent = 0;
  let savingsAmount = 0;

  if (compareAtPrice && compareAtPrice > price && price > 0) {
    savingsAmount = Math.max(0, compareAtPrice - price);
    discountPercent = Math.round(((compareAtPrice - price) / compareAtPrice) * 100);
  } else if (product.discountPercent && Number(product.discountPercent) >= 1) {
    discountPercent = Math.round(Number(product.discountPercent));
  }

  const hasDiscount = Boolean(compareAtPrice && compareAtPrice > price && discountPercent >= 1);

  return {
    hasDiscount,
    price,
    compareAtPrice: hasDiscount ? compareAtPrice : undefined,
    discountPercent: hasDiscount ? discountPercent : 0,
    savingsAmount: hasDiscount ? savingsAmount : 0,
    badgeText: hasDiscount ? `-${discountPercent}%` : '',
    detailBadgeText: hasDiscount ? `-${discountPercent}% OFF` : '',
  };
}
