import type { Metadata } from 'next';
import { NotificationsPage } from '../../../src/components/account/NotificationsPage';

export const metadata: Metadata = {
  title: 'Notifications',
  robots: { index: false, follow: false },
};

export default function AccountNotificationsPage() {
  return <NotificationsPage />;
}
