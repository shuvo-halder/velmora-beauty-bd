import type { Metadata } from 'next';
import { OrdersPage } from '../../../src/components/account/OrdersPage';

export const metadata: Metadata = {
  title: 'My Orders',
  robots: { index: false, follow: false },
};

export default function AccountOrdersPage() {
  return <OrdersPage />;
}
