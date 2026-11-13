import type { Metadata } from 'next';
import { OrderConfirmationPage } from '../../src/components/cart/OrderConfirmationPage';

export const metadata: Metadata = {
  title: 'Order Confirmation',
  robots: { index: false, follow: false },
};

export default function OrderConfirmationRoutePage() {
  return <OrderConfirmationPage />;
}
