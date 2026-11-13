import type { Metadata } from 'next';
import { OrderDetailsPage } from '../../../../../src/components/account/OrderDetailsPage';

export const metadata: Metadata = {
  title: 'Order Tracking',
  robots: { index: false, follow: false },
};

export default function OrderTrackingPage() {
  return <OrderDetailsPage />;
}
