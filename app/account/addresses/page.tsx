import type { Metadata } from 'next';
import { AddressesPage } from '../../../src/components/account/AddressesPage';

export const metadata: Metadata = {
  title: 'Saved Addresses',
  robots: { index: false, follow: false },
};

export default function AccountAddressesPage() {
  return <AddressesPage />;
}
