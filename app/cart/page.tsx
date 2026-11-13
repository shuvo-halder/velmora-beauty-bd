import type { Metadata } from 'next';
import { CartPage } from '../../src/components/cart/CartPage';

export const metadata: Metadata = {
  title: 'Cart',
  robots: { index: false, follow: false },
};

export default function CartRoutePage() {
  return <CartPage />;
}
