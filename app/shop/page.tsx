import type { Metadata } from 'next';
import { ShopCatalogView } from '../../src/components/shop/ShopCatalogView';

export const metadata: Metadata = {
  title: 'Shop',
};

export default function ShopRoutePage() {
  return <ShopCatalogView />;
}
