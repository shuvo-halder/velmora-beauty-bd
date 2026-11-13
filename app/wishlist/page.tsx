import type { Metadata } from 'next';
import { WishlistPage } from '../../src/components/account/WishlistPage';

export const metadata: Metadata = {
  title: 'Wishlist',
};

export default function WishlistRoutePage() {
  return <WishlistPage />;
}
