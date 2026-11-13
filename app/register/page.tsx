import type { Metadata } from 'next';
import { RegisterPage } from '../../src/components/auth/RegisterPage';

export const metadata: Metadata = {
  title: 'Register',
  robots: { index: false, follow: false },
};

export default function RegisterRoutePage() {
  return <RegisterPage />;
}
