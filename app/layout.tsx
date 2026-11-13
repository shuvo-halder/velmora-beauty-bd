import type { Metadata } from 'next';
import '../src/index.css';
import { StorefrontProviders } from '../src/providers/StorefrontProviders';
import { AnalyticsProvider } from '../src/providers/AnalyticsProvider';
import { Header } from '../src/components/common/Header';
import { Footer } from '../src/components/common/Footer';
import { CartDrawer } from '../src/components/common/CartDrawer';
import { QuickViewModal } from '../src/components/common/QuickViewModal';
import { ToastContainer } from '../src/components/common/ToastContainer';
import { AuthModal } from '../src/components/account/AuthModal';
import { PromotionalPopup } from '../src/components/common/PromotionalPopup';
import { getHomepageMetadata, getPublicSiteSettings } from '../src/lib/seo';
import { storefrontApi } from '../src/services/storefrontApi';
import { DEFAULT_SETTINGS } from '../src/services/settingsService';
import { PublicSettings } from '../src/types/storefront';
import { deriveBrandColors } from '../src/lib/brandColor';

export const dynamic = 'force-dynamic';

export async function generateMetadata(): Promise<Metadata> {
  return await getHomepageMetadata();
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const settings = await getPublicSiteSettings();
  const initialSettings: PublicSettings = settings || DEFAULT_SETTINGS;
  const brandColors = deriveBrandColors(initialSettings?.branding?.primaryColor);

  let initialAnalyticsConfig = null;
  try {
    const analyticsPromise = storefrontApi.getAnalyticsConfig();
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('Analytics config fetch timeout after 3000ms')), 3000);
    });
    initialAnalyticsConfig = await Promise.race([analyticsPromise, timeoutPromise]);
  } catch (err) {
    console.warn('Failed to fetch initial analytics config within 3s timeout:', err);
  }

  return (
    <html lang="en" className="light">
      <head>
        <style
          id="brand-primary-tokens"
          dangerouslySetInnerHTML={{
            __html: `:root{--color-primary:${brandColors.primary};--color-primary-hover:${brandColors.hover};--color-primary-light:${brandColors.light};--color-primary-text:${brandColors.text};--color-accent:${brandColors.primary};--color-accent-hover:${brandColors.hover};--color-accent-muted:${brandColors.light};--color-footer:${brandColors.footer};}`,
          }}
        />
      </head>
      <body className="min-h-screen bg-bg text-ink font-sans flex flex-col justify-between selection:bg-primary selection:text-white antialiased overflow-x-hidden">
        <StorefrontProviders initialSettings={initialSettings}>
          <AnalyticsProvider initialConfig={initialAnalyticsConfig} />
          <div>
            <Header />
            <main>{children}</main>
          </div>
          <Footer />
          <CartDrawer />
          <QuickViewModal />
          <AuthModal />
          <ToastContainer />
          <PromotionalPopup />
        </StorefrontProviders>
      </body>
    </html>
  );
}

