import type { Metadata } from 'next';
import { cache } from 'react';
import { storefrontApi } from '../services/storefrontApi';

import { getSiteUrl } from './siteUrl';

export const getPublicSiteSettings = cache(async () => {
  try {
    const settingsPromise = storefrontApi.getPublicSettings();
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('Settings fetch timeout after 3000ms')), 3000);
    });
    const settings = await Promise.race([settingsPromise, timeoutPromise]);
    return settings || null;
  } catch (err) {
    console.warn('Failed to fetch public site settings within 3s timeout:', err);
    return null;
  }
});

export function getSiteName(settings: any): string {
  return (
    settings?.general?.siteName ||
    settings?.siteName ||
    settings?.branding?.siteName ||
    settings?.general?.siteTitle ||
    settings?.siteTitle ||
    'Store'
  );
}

export function getFaviconUrl(settings: any): string {
  return settings?.branding?.faviconUrl || settings?.faviconUrl || '/favicon.svg';
}

export function resolveOgImage(customImage?: string | null, settings?: any): string | null {
  if (customImage && typeof customImage === 'string' && customImage.trim() && !customImage.includes('favicon.svg')) {
    return customImage.trim();
  }
  const ogImg = settings?.seo?.ogImageUrl || settings?.seo?.ogImage;
  if (ogImg && typeof ogImg === 'string' && ogImg.trim()) {
    return ogImg.trim();
  }
  const logo = settings?.branding?.logoUrl || settings?.logoUrl;
  if (logo && typeof logo === 'string' && logo.trim()) {
    return logo.trim();
  }
  return null;
}

/**
 * 1. Homepage Metadata
 */
export async function getHomepageMetadata(): Promise<Metadata> {
  const settings = await getPublicSiteSettings();
  const siteName = getSiteName(settings);
  const title =
    settings?.seo?.metaTitle ||
    settings?.general?.siteTitle ||
    settings?.branding?.siteTitle ||
    settings?.siteTitle ||
    `${siteName} — Official Store & Online Shopping`;
  const description =
    settings?.seo?.metaDescription ||
    'Discover a wide range of quality products, best deals, and reliable customer service for all your shopping needs.';
  
  const rawKeywords = settings?.seo?.metaKeywords || (settings?.seo as any)?.keywords;
  const keywords = rawKeywords
    ? String(rawKeywords).split(',').map((k: string) => k.trim())
    : ['online store', 'shopping', siteName, 'deals', 'new arrivals', 'products'];

  const ogTitle = settings?.seo?.ogTitle || title;
  const ogDescription = settings?.seo?.ogDescription || description;
  const ogImage = resolveOgImage(null, settings);

  const twitterTitle = settings?.seo?.twitterTitle || title;
  const twitterDescription = settings?.seo?.twitterDescription || description;
  const twitterImage = settings?.seo?.twitterImage || ogImage;

  const favicon = getFaviconUrl(settings);

  return {
    ...((() => { const u = getSiteUrl(); return u ? { metadataBase: new URL(u) } : {}; })()),
    title,
    description,
    keywords,
    icons: {
      icon: favicon,
      shortcut: favicon,
      apple: favicon,
    },
    openGraph: {
      title: ogTitle,
      description: ogDescription,
      ...((() => { const u = getSiteUrl(); return u ? { url: u } : {}; })()),
      siteName,
      ...(ogImage ? { images: [{ url: ogImage }] } : {}),
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: twitterTitle,
      description: twitterDescription,
      ...(twitterImage ? { images: [twitterImage] } : {}),
    },
    ...((() => { const u = getSiteUrl(); return u ? { alternates: { canonical: u } } : {}; })()),
    robots: {
      index: true,
      follow: true,
    },
  };
}

/**
 * 2. Products Listing Metadata
 */
export async function getProductsListingMetadata(): Promise<Metadata> {
  const settings = await getPublicSiteSettings();
  const siteName = getSiteName(settings);
  const title = `All Products | ${siteName}`;
  const description = `Browse the complete collection of high-performance audio equipment, workstation accessories, and power solutions at ${siteName}.`;
  const canonical = (getSiteUrl() ? `${getSiteUrl()}/products` : undefined);
  const favicon = getFaviconUrl(settings);
  const ogImage = resolveOgImage(null, settings);

  return {
    title,
    description,
    icons: { icon: favicon, shortcut: favicon, apple: favicon },
    openGraph: {
      title,
      description,
      ...(canonical ? { url: canonical } : {}),
      siteName,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
    ...(canonical ? { alternates: { canonical } } : {}),
  };
}

/**
 * Categories Index Metadata
 */
export async function getCategoriesIndexMetadata(): Promise<Metadata> {
  const settings = await getPublicSiteSettings();
  const siteName = getSiteName(settings);
  const title = `Categories | ${siteName}`;
  const description = `Browse all product categories and departments at ${siteName}.`;
  const canonical = (getSiteUrl() ? `${getSiteUrl()}/categories` : undefined);
  const favicon = getFaviconUrl(settings);
  const ogImage = resolveOgImage(null, settings);

  return {
    title,
    description,
    icons: { icon: favicon, shortcut: favicon, apple: favicon },
    openGraph: { title, description, ...(canonical ? { url: canonical } : {}), siteName, ...(ogImage ? { images: [{ url: ogImage }] } : {}), type: 'website' },
    twitter: { card: 'summary_large_image', title, description, ...(ogImage ? { images: [ogImage] } : {}) },
    ...(canonical ? { alternates: { canonical } } : {}),
  };
}

/**
 * Brands Index Metadata
 */
export async function getBrandsIndexMetadata(): Promise<Metadata> {
  const settings = await getPublicSiteSettings();
  const siteName = getSiteName(settings);
  const title = `Official Brands | ${siteName}`;
  const description = `Explore authentic collections and products from verified brand partners at ${siteName}.`;
  const canonical = (getSiteUrl() ? `${getSiteUrl()}/brands` : undefined);
  const favicon = getFaviconUrl(settings);
  const ogImage = resolveOgImage(null, settings);

  return {
    title,
    description,
    icons: { icon: favicon, shortcut: favicon, apple: favicon },
    openGraph: { title, description, ...(canonical ? { url: canonical } : {}), siteName, ...(ogImage ? { images: [{ url: ogImage }] } : {}), type: 'website' },
    twitter: { card: 'summary_large_image', title, description, ...(ogImage ? { images: [ogImage] } : {}) },
    ...(canonical ? { alternates: { canonical } } : {}),
  };
}

/**
 * Blog Index Metadata
 */
export async function getBlogIndexMetadata(): Promise<Metadata> {
  const settings = await getPublicSiteSettings();
  const siteName = getSiteName(settings);
  const title = `Journal & Articles | ${siteName}`;
  const description = `Read the latest shopping guides, articles, product highlights, and news at ${siteName}.`;
  const canonical = (getSiteUrl() ? `${getSiteUrl()}/blog` : undefined);
  const favicon = getFaviconUrl(settings);
  const ogImage = resolveOgImage(null, settings);

  return {
    title,
    description,
    icons: { icon: favicon, shortcut: favicon, apple: favicon },
    openGraph: { title, description, ...(canonical ? { url: canonical } : {}), siteName, ...(ogImage ? { images: [{ url: ogImage }] } : {}), type: 'website' },
    twitter: { card: 'summary_large_image', title, description, ...(ogImage ? { images: [ogImage] } : {}) },
    ...(canonical ? { alternates: { canonical } } : {}),
  };
}

/**
 * 3. Product Detail Metadata
 */
export async function getProductDetailMetadata(slug: string): Promise<Metadata> {
  const settings = await getPublicSiteSettings();
  const siteName = getSiteName(settings);
  const favicon = getFaviconUrl(settings);
  const canonical = (getSiteUrl() ? `${getSiteUrl()}/products/${slug}` : undefined);

  try {
    const product = await storefrontApi.getProductBySlug(slug);
    if (!product) {
      const missingTitle = `Product Not Found | ${siteName}`;
      const missingDesc = `The requested product could not be found on ${siteName}.`;
      return {
        title: missingTitle,
        description: missingDesc,
        icons: { icon: favicon, shortcut: favicon, apple: favicon },
        openGraph: { title: missingTitle, description: missingDesc, ...(canonical ? { url: canonical } : {}), siteName },
        twitter: { card: 'summary_large_image', title: missingTitle, description: missingDesc },
        ...(canonical ? { alternates: { canonical } } : {}),
      };
    }

    const rawProduct = product as any;
    const entityTitle = product.name || rawProduct.title || rawProduct.seoTitle || rawProduct.productName || (product.slug ? product.slug.replace(/[-_]/g, ' ') : 'Product');
    const pageTitle = `${entityTitle} | ${siteName}`;
    const description = rawProduct.seoDescription || product.description || product.subtitle || `Buy ${entityTitle} at ${siteName}. High quality and genuine products.`;
    const rawImage = rawProduct.ogImage || (product.images && product.images.length > 0 ? product.images[0] : rawProduct.thumbnail);
    const image = resolveOgImage(rawImage, settings);

    return {
      title: pageTitle,
      description: description.substring(0, 160),
      keywords: product.tags && product.tags.length > 0 ? product.tags : [entityTitle, product.category, product.brand, siteName].filter(Boolean),
      icons: { icon: favicon, shortcut: favicon, apple: favicon },
      openGraph: {
        title: pageTitle,
        description: description.substring(0, 160),
        ...(canonical ? { url: canonical } : {}),
        siteName,
        ...(image ? { images: [{ url: image, alt: entityTitle }] } : {}),
        type: 'website',
      },
      twitter: {
        card: 'summary_large_image',
        title: pageTitle,
        description: description.substring(0, 160),
        ...(image ? { images: [image] } : {}),
      },
      ...(canonical ? { alternates: { canonical } } : {}),
    };
  } catch (err) {
    const errorTitle = `Product Not Found | ${siteName}`;
    return {
      title: errorTitle,
      description: `The requested product could not be found on ${siteName}.`,
      icons: { icon: favicon, shortcut: favicon, apple: favicon },
      openGraph: { title: errorTitle, ...(canonical ? { url: canonical } : {}), siteName },
      ...(canonical ? { alternates: { canonical } } : {}),
    };
  }
}

/**
 * 4. Category Detail Metadata
 */
export async function getCategoryDetailMetadata(slug: string): Promise<Metadata> {
  const settings = await getPublicSiteSettings();
  const siteName = getSiteName(settings);
  const favicon = getFaviconUrl(settings);
  const canonical = (getSiteUrl() ? `${getSiteUrl()}/categories/${slug}` : undefined);

  try {
    const categories = await storefrontApi.getCategories();
    const findCat = (cats: any[]): any => {
      for (const c of cats) {
        if (c.slug === slug || c.id === slug) return c;
        if (c.children && c.children.length > 0) {
          const sub = findCat(c.children);
          if (sub) return sub;
        }
        if (c.subcategories && c.subcategories.length > 0) {
          const sub = findCat(c.subcategories);
          if (sub) return sub;
        }
      }
      return null;
    };
    const category = findCat(categories);

    if (!category) {
      const missingTitle = `Category Not Found | ${siteName}`;
      const missingDesc = `The requested category could not be found on ${siteName}.`;
      return {
        title: missingTitle,
        description: missingDesc,
        icons: { icon: favicon, shortcut: favicon, apple: favicon },
        openGraph: { title: missingTitle, description: missingDesc, ...(canonical ? { url: canonical } : {}), siteName },
        twitter: { card: 'summary_large_image', title: missingTitle, description: missingDesc },
        ...(canonical ? { alternates: { canonical } } : {}),
      };
    }

    const entityTitle = category.seoTitle || category.name || slug;
    const pageTitle = `${entityTitle} | ${siteName}`;
    const description = category.seoDescription || category.description || `Shop the latest ${entityTitle} products and deals at ${siteName}.`;
    const rawImage = category.ogImage || category.image;
    const image = resolveOgImage(rawImage, settings);

    return {
      title: pageTitle,
      description: description.substring(0, 160),
      icons: { icon: favicon, shortcut: favicon, apple: favicon },
      openGraph: {
        title: pageTitle,
        description: description.substring(0, 160),
        ...(canonical ? { url: canonical } : {}),
        siteName,
        images: [{ url: image, alt: entityTitle }],
        type: 'website',
      },
      twitter: {
        card: 'summary_large_image',
        title: pageTitle,
        description: description.substring(0, 160),
        images: [image],
      },
      ...(canonical ? { alternates: { canonical } } : {}),
    };
  } catch (err) {
    const errorTitle = `Category Not Found | ${siteName}`;
    return {
      title: errorTitle,
      description: `The requested category could not be found on ${siteName}.`,
      icons: { icon: favicon, shortcut: favicon, apple: favicon },
      openGraph: { title: errorTitle, ...(canonical ? { url: canonical } : {}), siteName },
      ...(canonical ? { alternates: { canonical } } : {}),
    };
  }
}

/**
 * 5. Brand Detail Metadata
 */
export async function getBrandDetailMetadata(slug: string): Promise<Metadata> {
  const settings = await getPublicSiteSettings();
  const siteName = getSiteName(settings);
  const favicon = getFaviconUrl(settings);
  const canonical = (getSiteUrl() ? `${getSiteUrl()}/brands/${slug}` : undefined);

  try {
    const brands = await storefrontApi.getBrands();
    const brand = brands.find(b => b.slug === slug || b.id === slug) as any;

    if (!brand) {
      const missingTitle = `Brand Not Found | ${siteName}`;
      const missingDesc = `The requested brand could not be found on ${siteName}.`;
      return {
        title: missingTitle,
        description: missingDesc,
        icons: { icon: favicon, shortcut: favicon, apple: favicon },
        openGraph: { title: missingTitle, description: missingDesc, ...(canonical ? { url: canonical } : {}), siteName },
        twitter: { card: 'summary_large_image', title: missingTitle, description: missingDesc },
        ...(canonical ? { alternates: { canonical } } : {}),
      };
    }

    const entityTitle = brand.seoTitle || brand.name || slug;
    const pageTitle = `${entityTitle} | ${siteName}`;
    const description = brand.seoDescription || brand.description || `Discover authentic products from ${entityTitle} at ${siteName}.`;
    const rawImage = brand.ogImage || brand.logo || brand.logoUrl;
    const image = resolveOgImage(rawImage, settings);

    return {
      title: pageTitle,
      description: description.substring(0, 160),
      icons: { icon: favicon, shortcut: favicon, apple: favicon },
      openGraph: {
        title: pageTitle,
        description: description.substring(0, 160),
        ...(canonical ? { url: canonical } : {}),
        siteName,
        images: [{ url: image, alt: entityTitle }],
        type: 'website',
      },
      twitter: {
        card: 'summary_large_image',
        title: pageTitle,
        description: description.substring(0, 160),
        images: [image],
      },
      ...(canonical ? { alternates: { canonical } } : {}),
    };
  } catch (err) {
    const errorTitle = `Brand Not Found | ${siteName}`;
    return {
      title: errorTitle,
      description: `The requested brand could not be found on ${siteName}.`,
      icons: { icon: favicon, shortcut: favicon, apple: favicon },
      openGraph: { title: errorTitle, ...(canonical ? { url: canonical } : {}), siteName },
      ...(canonical ? { alternates: { canonical } } : {}),
    };
  }
}

/**
 * 6. Blog Detail Metadata
 */
export async function getBlogDetailMetadata(slug: string): Promise<Metadata> {
  const settings = await getPublicSiteSettings();
  const siteName = getSiteName(settings);
  const favicon = getFaviconUrl(settings);
  const canonical = (getSiteUrl() ? `${getSiteUrl()}/blog/${slug}` : undefined);

  try {
    const article = await storefrontApi.getArticleBySlug(slug) as any;

    if (!article) {
      const missingTitle = `Article Not Found | ${siteName}`;
      const missingDesc = `The requested journal article could not be found on ${siteName}.`;
      return {
        title: missingTitle,
        description: missingDesc,
        icons: { icon: favicon, shortcut: favicon, apple: favicon },
        openGraph: { title: missingTitle, description: missingDesc, ...(canonical ? { url: canonical } : {}), siteName },
        twitter: { card: 'summary_large_image', title: missingTitle, description: missingDesc },
        ...(canonical ? { alternates: { canonical } } : {}),
      };
    }

    const entityTitle = article.title || 'Journal Article';
    const pageTitle = `${entityTitle} | ${siteName}`;
    const description = article.excerpt || article.content?.substring(0, 160) || `Read ${entityTitle} on the ${siteName} journal.`;
    const rawImage = article.coverImage || article.featuredImage?.secureUrl || article.featuredImage?.url;
    const image = resolveOgImage(rawImage, settings);

    return {
      title: pageTitle,
      description: description.substring(0, 160),
      keywords: article.tags && article.tags.length > 0 ? article.tags : ['journal', article.category, siteName].filter(Boolean),
      icons: { icon: favicon, shortcut: favicon, apple: favicon },
      openGraph: {
        title: pageTitle,
        description: description.substring(0, 160),
        ...(canonical ? { url: canonical } : {}),
        siteName,
        images: [{ url: image, alt: entityTitle }],
        type: 'article',
      },
      twitter: {
        card: 'summary_large_image',
        title: pageTitle,
        description: description.substring(0, 160),
        images: [image],
      },
      ...(canonical ? { alternates: { canonical } } : {}),
    };
  } catch (err) {
    const errorTitle = `Article Not Found | ${siteName}`;
    return {
      title: errorTitle,
      description: `The requested article could not be found on ${siteName}.`,
      icons: { icon: favicon, shortcut: favicon, apple: favicon },
      openGraph: { title: errorTitle, ...(canonical ? { url: canonical } : {}), siteName },
      ...(canonical ? { alternates: { canonical } } : {}),
    };
  }
}

/**
 * 7. CMS Page Metadata
 */
export async function getCMSPageMetadata(slug: string): Promise<Metadata> {
  const settings = await getPublicSiteSettings();
  const siteName = getSiteName(settings);
  const favicon = getFaviconUrl(settings);
  const ogImage = resolveOgImage(null, settings);
  const canonical = (getSiteUrl() ? `${getSiteUrl()}/pages/${slug}` : undefined);

  try {
    const page = await storefrontApi.getCMSPageBySlug(slug) as any;

    if (!page) {
      const missingTitle = `Page Not Found | ${siteName}`;
      const missingDesc = `The requested page could not be found on ${siteName}.`;
      return {
        title: missingTitle,
        description: missingDesc,
        icons: { icon: favicon, shortcut: favicon, apple: favicon },
        openGraph: { title: missingTitle, description: missingDesc, ...(canonical ? { url: canonical } : {}), siteName },
        twitter: { card: 'summary_large_image', title: missingTitle, description: missingDesc },
        ...(canonical ? { alternates: { canonical } } : {}),
      };
    }

    const entityTitle = page.metaTitle || page.title || slug;
    const pageTitle = `${entityTitle} | ${siteName}`;
    const description = page.metaDescription || page.content?.substring(0, 160) || `Learn more about ${entityTitle} at ${siteName}.`;

    return {
      title: pageTitle,
      description,
      icons: { icon: favicon, shortcut: favicon, apple: favicon },
      openGraph: {
        title: pageTitle,
        description,
        ...(canonical ? { url: canonical } : {}),
        siteName,
        type: 'website',
      },
      twitter: {
        card: 'summary_large_image',
        title: pageTitle,
        description,
      },
      ...(canonical ? { alternates: { canonical } } : {}),
    };
  } catch (err) {
    const errorTitle = `Page Not Found | ${siteName}`;
    return {
      title: errorTitle,
      description: `The requested page could not be found on ${siteName}.`,
      icons: { icon: favicon, shortcut: favicon, apple: favicon },
      openGraph: { title: errorTitle, ...(canonical ? { url: canonical } : {}), siteName },
      ...(canonical ? { alternates: { canonical } } : {}),
    };
  }
}

/**
 * 8. Search Page Metadata
 */
export async function getSearchPageMetadata(query?: string): Promise<Metadata> {
  const settings = await getPublicSiteSettings();
  const siteName = getSiteName(settings);
  const favicon = getFaviconUrl(settings);
  const ogImage = resolveOgImage(null, settings);
  const q = query?.trim();

  const title = q ? `Search results for "${q}" | ${siteName}` : `Search Products | ${siteName}`;
  const description = q 
    ? `Browse search results for "${q}" at ${siteName}.` 
    : `Search our entire catalog of products, collections, and deals at ${siteName}.`;
  
  const canonical = q 
    ? (getSiteUrl() ? `${getSiteUrl()}/search?q=${encodeURIComponent(q)}` : undefined) 
    : (getSiteUrl() ? `${getSiteUrl()}/search` : undefined);

  return {
    title,
    description,
    icons: { icon: favicon, shortcut: favicon, apple: favicon },
    openGraph: {
      title,
      description,
      ...(canonical ? { url: canonical } : {}),
      siteName,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
    ...(canonical ? { alternates: { canonical } } : {}),
  };
}
