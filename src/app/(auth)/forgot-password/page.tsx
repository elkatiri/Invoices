'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import { FileText } from 'lucide-react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { useI18n } from '@/lib/i18n/context';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const supabase = createClient();
  const { t } = useI18n();

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const { error: resetError } = await supabase.auth.resetPasswordForEmail(
      email,
      { redirectTo: `${window.location.origin}/auth/callback?next=/update-password` }
    );

    if (resetError) {
      setError(resetError.message);
      setLoading(false);
      return;
    }

    setLoading(false);
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-light-50 dark:bg-dark-900 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-4">
            <FileText className="text-orange-brand" size={32} />
            <span className="text-2xl font-bold text-dark-800 dark:text-light-50">
              {t.common.appName}
            </span>
          </Link>
          {!submitted && (
            <>
              <h1 className="text-xl font-semibold text-dark-800 dark:text-light-50">
                {t.auth.resetPassword}
              </h1>
              <p className="text-sm text-dark-700 dark:text-light-300 mt-1">
                {t.auth.resetDescription}
              </p>
            </>
          )}
        </div>

        {submitted ? (
          <div className="bg-white dark:bg-dark-800 rounded-xl border border-light-200 dark:border-dark-700 p-8 shadow-sm text-center">
            <div className="w-14 h-14 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-4">
              <svg className="w-7 h-7 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-dark-800 dark:text-light-50 mb-2">
              {t.auth.checkEmail}
            </h2>
            <p className="text-sm text-dark-700 dark:text-light-300 mb-1">
              {t.auth.resetSent}
            </p>
            <p className="text-sm font-medium text-dark-800 dark:text-light-50 mb-4">
              {email}
            </p>
            <p className="text-sm text-dark-700 dark:text-light-300">
              {t.auth.clickToReset}
            </p>
            <div className="mt-6">
              <Link
                href="/login"
                className="text-sm text-orange-brand hover:underline font-medium"
              >
                {t.auth.backToSignIn}
              </Link>
            </div>
          </div>
        ) : (
          <>
            <div className="bg-white dark:bg-dark-800 rounded-xl border border-light-200 dark:border-dark-700 p-6 shadow-sm">
              <form onSubmit={handleReset} className="space-y-4">
                <Input
                  label={t.auth.email}
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  autoComplete="email"
                />

                {error && (
                  <p className="text-sm text-error bg-error/10 rounded-lg px-3 py-2">
                    {error}
                  </p>
                )}

                <Button type="submit" loading={loading} className="w-full">
                  {t.auth.sendResetLink}
                </Button>
              </form>
            </div>

            <p className="text-center text-sm text-dark-700 dark:text-light-300 mt-4">
              {t.auth.rememberPassword}{' '}
              <Link
                href="/login"
                className="text-orange-brand hover:underline font-medium"
              >
                {t.auth.signInLink}
              </Link>
            </p>
          </>
        )}
      </div>
    </div>
  );
}
