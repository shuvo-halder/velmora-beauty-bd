'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useStorefront } from '../../context/StorefrontContext';
import { useSettings } from '../../context/SettingsContext';
import { ShieldAlert, ArrowLeft, Smartphone, Mail, Headphones } from 'lucide-react';

export const ForgotPasswordPage: React.FC = () => {
  const router = useRouter();
  const { navigateTo, publicSettings } = useStorefront();
  const { settings } = useSettings();
  const siteName = settings?.general?.siteName || publicSettings?.general?.siteName || 'Store';

  const supportEmail = publicSettings?.supportEmail || publicSettings?.general?.storeEmail || publicSettings?.store?.supportEmail;

  return (
    <div className="min-h-screen bg-bg flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center mb-6">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-amber-50 mb-4 border border-amber-200">
          <ShieldAlert size={24} className="text-amber-600" />
        </div>
        <h1 className="text-2xl font-bold text-ink">Account Access & Recovery</h1>
        <p className="mt-1.5 text-xs text-muted">
          Secure self-service access options for your {siteName} account
        </p>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 sm:px-8 shadow-xs rounded-xl border border-champagne/50 space-y-6">
          <div className="p-4 bg-amber-50/70 border border-amber-200/80 rounded-xl space-y-2">
            <h2 className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
              <span>Instant Access via Mobile OTP</span>
            </h2>
            <p className="text-xs text-amber-800/90 leading-relaxed">
              If you have registered your Bangladesh mobile number with your account, you can sign in immediately using a 6-digit one-time SMS verification code without requiring your password.
            </p>
          </div>

          <div className="space-y-3">
            <button
              type="button"
              onClick={() => router.push('/login')}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-primary hover:bg-primary-hover text-white text-xs font-bold rounded-lg transition-colors cursor-pointer shadow-xs"
            >
              <Smartphone size={16} />
              <span>Sign In with Mobile OTP</span>
            </button>

            <Link
              href="/login"
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-white border border-champagne/50 hover:bg-[#F9FAFB] text-ink text-xs font-bold rounded-lg transition-colors cursor-pointer"
            >
              <Mail size={16} />
              <span>Sign In with Email & Password</span>
            </Link>
          </div>

          <div className="pt-4 border-t border-champagne/50 space-y-3">
            <div className="flex items-start gap-2 text-xs text-muted">
              <Headphones size={16} className="text-taupe shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-ink block">Need Help Recovering Your Account?</span>
                <p className="text-[11px] text-muted mt-0.5">
                  Contact customer support {supportEmail ? <>at <span className="font-semibold text-ink">{supportEmail}</span></> : null} or via live support for identity verification and account restoration.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => navigateTo('login')}
              className="w-full flex items-center justify-center gap-1.5 pt-2 text-xs font-medium text-muted hover:text-ink transition-colors cursor-pointer"
            >
              <ArrowLeft size={14} />
              <span>Back to Sign In</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

