import type { Metadata } from 'next';
import { ShipmentsPage } from '../../../src/components/account/ShipmentsPage';

export const metadata: Metadata = {
  title: 'Shipments',
  robots: { index: false, follow: false },
};

export default function AccountShipmentsPage() {
  return <ShipmentsPage />;
}
