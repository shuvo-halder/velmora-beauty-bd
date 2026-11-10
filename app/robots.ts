import type { MetadataRoute } from 'next';
import { getSiteUrl } from '../src/lib/siteUrl';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = getSiteUrl();

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/account/',
          '/cart',
          '/checkout',
          '/wishlist',
          '/login',
          '/register',
          '/forgot-password',
          '/reset-password',
          '/order-confirmation',
          '/search',
        ],
      },
    ],
    ...(baseUrl ? { sitemap: `${baseUrl}/sitemap.xml` } : {}),
  };
}
