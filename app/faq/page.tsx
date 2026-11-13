import type { Metadata } from 'next';
import { FAQPage } from '../../src/components/content/FAQPage';

export const metadata: Metadata = {
  title: 'FAQ',
};

export default function FAQRoutePage() {
  return <FAQPage />;
}
