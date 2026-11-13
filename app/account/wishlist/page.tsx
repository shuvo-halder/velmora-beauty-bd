import type { Metadata } from 'next';
import { WishlistPage } from '../../../src/components/account/WishlistPage';

export const metadata: Metadata = {
  title: 'My Wishlist',
  robots: { index: false, follow: false },
};

export default function AccountWishlistPage() {
  return <WishlistPage />;
}
