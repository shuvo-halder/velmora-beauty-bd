import type { Metadata } from 'next';
import { CheckoutPage } from '../../src/components/cart/CheckoutPage';

export const metadata: Metadata = {
  title: 'Checkout',
  robots: { index: false, follow: false },
};

export default function CheckoutRoutePage() {
  return <CheckoutPage />;
}
