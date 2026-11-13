import type { Metadata } from 'next';
import { ReturnsPage } from '../../../src/components/account/ReturnsPage';

export const metadata: Metadata = {
  title: 'Returns',
  robots: { index: false, follow: false },
};

export default function AccountReturnsPage() {
  return <ReturnsPage />;
}
