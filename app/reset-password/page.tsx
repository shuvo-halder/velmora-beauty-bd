import type { Metadata } from 'next';
import { ForgotPasswordPage } from '../../src/components/auth/ForgotPasswordPage';

export const metadata: Metadata = {
  title: 'Reset Password',
  robots: { index: false, follow: false },
};

export default function ResetPasswordRoutePage() {
  return <ForgotPasswordPage />;
}
