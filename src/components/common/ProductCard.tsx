'use client';

import React from 'react';
import { SmartImage } from './SmartImage';
import { Product } from '../../types/storefront';
import { useStorefront } from '../../context/StorefrontContext';
import { useCart } from '../../hooks/useCart';
import { RatingStars } from './RatingStars';
import { trackGA4SelectItem } from '../../utils/analytics';
import { formatPrice } from '../../utils/formatters';
import { Heart, Eye, ShoppingCart, Sparkles, Zap, Loader2 } from 'lucide-react';
import { RichTextRenderer } from './RichTextRenderer';

interface ProductCardProps {
  product: Product;
  viewMode?: 'grid' | 'list';
  itemListId?: string;
  itemListName?: string;
  index?: number;
}

export const ProductCard = React.memo(({ 
  product, 
  viewMode = 'grid',
  itemListId = 'product_list',
  itemListName = 'Product List',
  index
}: ProductCardProps) => {
  const { 
    toggleWishlist, 
    isInWishlist, 
    openQuickView, 
    navigateTo,
    publicSettings
  } = useStorefront();

  const currencyCode = publicSettings?.general?.currency || 'BDT';
  const currencySymbol = publicSettings?.general?.currencySymbol || (currencyCode === 'BDT' ? '৳' : '৳');

  const { addToCart, isAddingToCart } = useCart();

  const inWishlist = isInWishlist(product.id);
  const secondImage = product.images[1] || product.images[0];

  const [isLocalAdding, setIsLocalAdding] = React.useState(false);

  const handleCardClick = () => {
    trackGA4SelectItem(itemListId, itemListName, product, index);
    navigateTo('product-detail', { productSlug: product.slug });
  };

  const onAddToCart = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsLocalAdding(true);
    try {
      await addToCart(product.id, 1);
    } finally {
      setIsLocalAdding(false);
    }
  };

  if (viewMode === 'list') {
    return (
      <div className="group bg-white border border-champagne/50 rounded-xl p-4 shadow-xs hover:border-champagne transition-colors flex flex-col sm:flex-row items-stretch gap-5 relative overflow-hidden">
        {/* Badges */}
        {product.discountPercent && (
          <div className="absolute top-3 left-3 bg-champagne text-ink font-bold text-[10px] px-2 py-0.5 rounded-md z-10 border border-champagne">
            -{product.discountPercent}%
          </div>
        )}

        {/* Thumbnail */}
        <div 
          onClick={handleCardClick}
          className="w-full sm:w-48 h-48 bg-[#F9FAFB] rounded-lg overflow-hidden relative flex-shrink-0 cursor-pointer"
        >
          <SmartImage 
            src={product.images[0]} 
            alt={product.name} 
            fill
            fallbackType="product"
            fallbackLabel={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
          />
        </div>

        {/* Info */}
        <div className="flex-1 flex flex-col justify-between py-1">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-primary">
                {product.brand}
              </span>
              <RatingStars rating={product.rating} count={product.reviewCount} />
            </div>

            <h3 
              onClick={handleCardClick}
              className="font-semibold text-lg text-ink group-hover:text-primary transition-colors cursor-pointer mt-1.5"
            >
              {product.name}
            </h3>

            {product.description ? (
              <div className="text-sm text-taupe line-clamp-2 mt-1.5 leading-relaxed overflow-hidden [&_p]:mb-0 [&_p]:inline [&_ul]:inline [&_ol]:inline [&_li]:inline [&_h1]:inline [&_h2]:inline [&_h3]:inline [&_h4]:inline [&_h5]:inline [&_h6]:inline [&_blockquote]:my-0 [&_pre]:my-0 [&_img]:hidden [&_table]:hidden [&_*]:text-sm [&_*]:text-taupe [&_strong]:font-semibold [&_b]:font-semibold">
                <RichTextRenderer content={product.description} />
              </div>
            ) : null}
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-champagne/50 mt-3">
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-bold text-ink">
                {formatPrice(product.price, currencyCode, currencySymbol)}
              </span>
              {product.compareAtPrice && (
                <span className="text-xs text-taupe line-through">
                  {formatPrice(product.compareAtPrice, currencyCode, currencySymbol)}
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => openQuickView(product)}
                className="p-2 bg-[#F9FAFB] hover:bg-gray-100 text-ink rounded-lg transition-colors cursor-pointer border border-champagne/50"
                title="Quick View"
              >
                <Eye size={16} />
              </button>
              <button
                onClick={() => toggleWishlist(product)}
                className={`p-2 rounded-lg border transition-colors cursor-pointer ${
                  inWishlist ? 'bg-sage/30 border-primary/20 text-primary' : 'bg-[#F9FAFB] border-champagne/50 text-taupe hover:text-primary'
                }`}
                title="Wishlist"
              >
                <Heart size={16} fill={inWishlist ? 'currentColor' : 'none'} />
              </button>
              <button
                onClick={onAddToCart}
                disabled={isLocalAdding || isAddingToCart}
                className="py-2 px-4 bg-primary hover:bg-primary-hover text-white font-semibold text-sm rounded-lg transition-colors flex items-center gap-2 cursor-pointer disabled:opacity-70 shadow-xs"
              >
                {isLocalAdding ? <Loader2 size={16} className="animate-spin" /> : <ShoppingCart size={16} />}
                <span>{isLocalAdding ? 'Adding...' : 'Add to Cart'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="group bg-white border border-champagne/50 rounded-xl p-2 sm:p-2.5 shadow-xs hover:border-champagne transition-colors flex flex-col justify-between relative overflow-hidden h-full">
      
      {/* Badges Top Left */}
      <div className="absolute top-2 left-2 z-10 flex flex-col gap-1 items-start">
        {product.discountPercent && (
          <span className="bg-champagne text-ink font-bold text-[9px] sm:text-[10px] px-1.5 py-0.5 rounded-md shadow-xs border border-champagne">
            -{product.discountPercent}%
          </span>
        )}
        {product.isNew && (
          <span className="bg-beige text-ink font-bold text-[9px] sm:text-[10px] px-1.5 py-0.5 rounded-md shadow-xs">
            NEW
          </span>
        )}
      </div>

      {/* Wishlist Button Top Right */}
      <button
        onClick={() => toggleWishlist(product)}
        className={`absolute top-2 right-2 z-10 p-1 sm:p-1.5 rounded-full border transition-colors cursor-pointer ${
          inWishlist 
            ? 'bg-sage/30 text-primary border-primary/20' 
            : 'bg-white/90 text-taupe border-champagne/50 hover:text-primary hover:bg-white'
        }`}
        aria-label="Wishlist"
      >
        <Heart size={14} fill={inWishlist ? 'currentColor' : 'none'} />
      </button>

      {/* Image Gallery Stage with Quick View Overlay */}
      <div 
        onClick={handleCardClick}
        className="relative aspect-square bg-[#F9FAFB] rounded-lg overflow-hidden cursor-pointer group/img mb-2"
      >
        <SmartImage 
          src={product.images[0]} 
          alt={product.name} 
          fill
          fallbackType="product"
          fallbackLabel={product.name}
          className="w-full h-full object-cover transition-opacity duration-300 group-hover/img:opacity-0" 
        />
        {secondImage && (
          <SmartImage 
            src={secondImage} 
            alt={product.name} 
            fill
            fallbackType="product"
            fallbackLabel={product.name}
            className="w-full h-full object-cover absolute inset-0 opacity-0 transition-opacity duration-300 group-hover/img:opacity-100 group-hover/img:scale-105" 
          />
        )}

        {/* Quick View Hover Trigger */}
        <div className="absolute inset-x-1.5 bottom-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200 hidden sm:block">
          <button
            onClick={(e) => {
              e.stopPropagation();
              openQuickView(product);
            }}
            className="w-full py-1 px-1.5 bg-white/95 hover:bg-white text-ink font-semibold text-[10px] rounded-md shadow-xs border border-champagne/50 flex items-center justify-center gap-1 transition-colors cursor-pointer"
          >
            <Eye size={12} className="text-primary" />
            <span>Quick View</span>
          </button>
        </div>
      </div>

      {/* Product Information */}
      <div className="space-y-1 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between text-[9px] sm:text-[10px] font-medium text-taupe min-h-[14px]">
            <span className="text-primary font-semibold uppercase tracking-wider truncate max-w-[55%]">{product.brand}</span>
            <RatingStars rating={product.rating} count={product.reviewCount} showNumber={false} size={11} />
          </div>

          <h3 
            onClick={handleCardClick}
            className="font-medium text-xs text-ink group-hover:text-primary transition-colors cursor-pointer line-clamp-2 mt-0.5 leading-snug min-h-[2rem]"
            title={product.name}
          >
            {product.name}
          </h3>
        </div>

        {/* Color variants indication */}
        {product.variants && product.variants.length > 0 && (
          <div className="flex items-center gap-1 pt-0.5">
            {product.variants.slice(0, 3).map((v) => (
              <span 
                key={v.id} 
                className="w-1.5 h-1.5 rounded-full border border-gray-300" 
                style={{ backgroundColor: v.colorHex || '#94a3b8' }} 
                title={v.name}
              />
            ))}
            {product.variants.length > 3 && (
              <span className="text-[8px] text-taupe font-medium pl-0.5">
                +{product.variants.length - 3}
              </span>
            )}
          </div>
        )}

        {/* Price and Cart Row */}
        <div className="pt-1.5 flex items-center justify-between mt-auto border-t border-champagne/50/80">
          <div className="flex flex-col">
            {product.compareAtPrice ? (
              <span className="text-[9px] sm:text-[10px] text-taupe line-through font-medium leading-none mb-0.5">
                {formatPrice(product.compareAtPrice, currencyCode, currencySymbol)}
              </span>
            ) : null}
            <span className="text-xs sm:text-sm font-bold text-ink leading-tight">
              {formatPrice(product.price, currencyCode, currencySymbol)}
            </span>
          </div>

          <button
            onClick={onAddToCart}
            disabled={isLocalAdding || isAddingToCart}
            className="w-7 sm:w-8 h-7 sm:h-8 bg-primary hover:bg-primary-hover text-white rounded-lg shadow-xs transition-colors cursor-pointer disabled:opacity-70 flex items-center justify-center shrink-0"
            title="Add to Cart"
            aria-label="Add to cart"
          >
            {isLocalAdding ? (
              <Loader2 size={13} className="animate-spin" />
            ) : (
              <ShoppingCart size={13} />
            )}
          </button>
        </div>

      </div>

    </div>
  );
});
