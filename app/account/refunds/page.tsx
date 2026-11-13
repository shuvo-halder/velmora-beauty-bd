import type { Metadata } from 'next';
import { RefundsPage } from '../../../src/components/account/RefundsPage';

export const metadata: Metadata = {
  title: 'Refunds',
  robots: { index: false, follow: false },
};

export default function AccountRefundsPage() {
  return <RefundsPage />;
}
