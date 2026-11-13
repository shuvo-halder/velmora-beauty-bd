/**
 * Shared discount computation utility.
 * Ensures consistent discount calculation, badge labels, and savings amounts across the storefront.
 * GUARANTEE: The displayed price and compareAtPrice ALWAYS come from the SAME variant.
 * Never mixes root price with a different variant's compareAtPrice.
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
 * 
 * Rules:
 * 1. If an explicit variant is passed (e.g. selected on PDP or QuickView), both price and compareAtPrice
 *    must come strictly from that variant.
 * 2. If no variant is passed, but product has variants, the representative variant providing the lowest
 *    price is chosen for both price and compareAtPrice.
 * 3. If product has no variants, price and compareAtPrice come from the product root.
 * 4. Only shows discount when compareAtPrice > price and percent >= 1.
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

  let price = 0;
  let rawCompare: number | undefined;

  if (variant) {
    // 1. Explicitly selected variant: both price and compareAtPrice come from this variant
    price = Number(variant.price ?? product.price ?? 0);
    if (variant.compareAtPrice !== undefined && variant.compareAtPrice !== null && !isNaN(Number(variant.compareAtPrice))) {
      rawCompare = Number(variant.compareAtPrice);
    }
  } else if (Array.isArray(product.variants) && product.variants.length > 0) {
    // 2. Multi-variant product: select the variant providing the lowest displayed price
    let lowestVariant = product.variants[0];
    for (let i = 1; i < product.variants.length; i++) {
      const v = product.variants[i];
      if (!v) continue;
      const vPrice = Number(v.price ?? 0);
      const lowPrice = Number(lowestVariant?.price ?? 0);
      if (vPrice < lowPrice) {
        lowestVariant = v;
      } else if (vPrice === lowPrice) {
        // Tied in price: prefer the one with a valid discount
        const vCompare = Number(v.compareAtPrice ?? 0);
        const lowCompare = Number(lowestVariant?.compareAtPrice ?? 0);
        if (vCompare > vPrice && !(lowCompare > lowPrice)) {
          lowestVariant = v;
        }
      }
    }

    price = Number(lowestVariant?.price ?? product.price ?? 0);
    if (lowestVariant?.compareAtPrice !== undefined && lowestVariant.compareAtPrice !== null && !isNaN(Number(lowestVariant.compareAtPrice))) {
      rawCompare = Number(lowestVariant.compareAtPrice);
    }
  } else {
    // 3. Simple product (no variants): both price and compareAtPrice come from root
    price = Number(product.price ?? 0);
    if (product.compareAtPrice !== undefined && product.compareAtPrice !== null && !isNaN(Number(product.compareAtPrice))) {
      rawCompare = Number(product.compareAtPrice);
    }
  }

  // Only valid if compareAtPrice is strictly greater than price
  const compareAtPrice = (rawCompare !== undefined && rawCompare > price) ? rawCompare : undefined;

  let discountPercent = 0;
  let savingsAmount = 0;

  if (compareAtPrice && compareAtPrice > price && price > 0) {
    savingsAmount = Math.max(0, compareAtPrice - price);
    discountPercent = Math.round(((compareAtPrice - price) / compareAtPrice) * 100);
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
