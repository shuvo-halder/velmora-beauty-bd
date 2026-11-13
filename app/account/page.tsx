import type { Metadata } from 'next';
import { AccountDashboard } from '../../src/components/account/AccountDashboard';

export const metadata: Metadata = {
  title: 'My Account',
  robots: { index: false, follow: false },
};

export default function AccountPage() {
  return <AccountDashboard />;
}
