import type { Metadata } from 'next';
import { ProfilePage } from '../../../src/components/account/ProfilePage';

export const metadata: Metadata = {
  title: 'My Profile',
  robots: { index: false, follow: false },
};

export default function AccountProfilePage() {
  return <ProfilePage />;
}
