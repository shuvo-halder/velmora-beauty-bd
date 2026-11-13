import type { Metadata } from 'next';
import { ActivityPage } from '../../../src/components/account/ActivityPage';

export const metadata: Metadata = {
  title: 'Activity',
  robots: { index: false, follow: false },
};

export default function AccountActivityPage() {
  return <ActivityPage />;
}
