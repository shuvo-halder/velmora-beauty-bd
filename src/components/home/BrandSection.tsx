'use client';

import React from 'react';
import { useStorefront } from '../../context/StorefrontContext';
import { Award, ArrowRight } from 'lucide-react';
import { Skeleton } from '../ui/Skeleton';
import { Badge } from '../ui/Badge';

export const BrandSection: React.FC = () => {
  const { brands, isLoading, navigateTo, setFilters } = useStorefront();

  const handleBrandClick = (brandSlug: string) => {
    setFilters(prev => ({ ...prev, brandSlugs: [brandSlug] }));
    navigateTo('shop');
  };

  if (isLoading) {
    return (
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <Skeleton className="h-5 w-32 mb-4 bg-slate-200" />
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full rounded-xl bg-slate-200" />
          ))}
        </div>
      </section>
    );
  }

  if (!brands || brands.length === 0) return null;

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-4 sm:mb-5">
        <div>
          <div className="flex items-center gap-2 text-primary font-semibold text-xs uppercase tracking-wider mb-0.5">
            <Award size={14} />
            <span>Featured Brand Partners</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-ink tracking-tight">
            Featured Brands
          </h2>
        </div>

        <button
          onClick={() => {
            setFilters(prev => ({ ...prev, brandSlugs: [] }));
            navigateTo('shop');
          }}
          className="text-xs font-semibold text-primary hover:text-primary-hover flex items-center gap-1 transition-colors cursor-pointer self-start sm:self-auto min-h-[32px]"
        >
          <span>View All Brands</span>
          <ArrowRight size={14} />
        </button>
      </div>

      {/* Brands Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
        {brands.map((brand) => (
          <div
            key={brand.id}
            onClick={() => handleBrandClick(brand.slug)}
            className="group bg-white border border-champagne/50 hover:border-primary/40 rounded-xl p-3 sm:p-3.5 text-center transition-all duration-200 cursor-pointer flex flex-col items-center justify-between min-h-[85px] sm:min-h-[95px] shadow-2xs"
          >
            <div className="font-semibold text-ink group-hover:text-primary transition-colors text-xs sm:text-sm tracking-tight my-auto line-clamp-1">
              {brand.name}
            </div>

            <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-sage/20 border border-champagne/40 text-[10px] font-semibold text-taupe">
              {brand.itemCount ?? 0} Items
            </span>
          </div>
        ))}
      </div>

    </section>
  );
};
