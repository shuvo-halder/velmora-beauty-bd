import type { Metadata } from 'next';
import { LoginPage } from '../../src/components/auth/LoginPage';

export const metadata: Metadata = {
  title: 'Login',
  robots: { index: false, follow: false },
};

export default function LoginRoutePage() {
  return <LoginPage />;
}
