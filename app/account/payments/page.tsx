import type { Metadata } from 'next';
import { PaymentsPage } from '../../../src/components/account/PaymentsPage';

export const metadata: Metadata = {
  title: 'Payments',
  robots: { index: false, follow: false },
};

export default function AccountPaymentsPage() {
  return <PaymentsPage />;
}
