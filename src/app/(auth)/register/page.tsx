'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FileText, ArrowLeft } from 'lucide-react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import ThemeToggle from '@/components/ThemeToggle';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import { useI18n } from '@/lib/i18n/context';

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const router = useRouter();
  const supabase = createClient();
  const { t } = useI18n();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError(t.auth.passwordsNoMatch);
      return;
    }

    if (password.length < 6) {
      setError(t.auth.passwordTooShort);
      return;
    }

    setLoading(true);

    const { error: authError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    setLoading(false);
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-light-50 dark:bg-dark-900">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4">
        <Link href="/" className="inline-flex items-center gap-2 text-sm text-dark-700 dark:text-light-300 hover:text-orange-brand transition-colors">
          <ArrowLeft size={16} />
          {t.common.backToHome}
        </Link>
        <div className="flex items-center gap-2">
          <LanguageSwitcher variant="compact" />
          <ThemeToggle />
        </div>
      </header>

      <div className="flex-1 flex items-center justify-center px-4">
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
                {t.auth.createAccount}
              </h1>
              <p className="text-sm text-dark-700 dark:text-light-300 mt-1">
                {t.auth.startManaging}
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
              {t.auth.confirmationSent}
            </p>
            <p className="text-sm font-medium text-dark-800 dark:text-light-50 mb-4">
              {email}
            </p>
            <p className="text-sm text-dark-700 dark:text-light-300">
              {t.auth.clickToVerify}
            </p>
            <div className="mt-6">
              <Link
                href="/login"
                className="text-sm text-orange-brand hover:underline font-medium"
              >
                {t.auth.goToSignIn}
              </Link>
            </div>
          </div>
        ) : (
        <>
        <div className="bg-white dark:bg-dark-800 rounded-xl border border-light-200 dark:border-dark-700 p-6 shadow-sm">
          <form onSubmit={handleRegister} className="space-y-4">
            <Input
              label={t.auth.email}
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              autoComplete="email"
            />
            <Input
              label={t.auth.password}
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              autoComplete="new-password"
            />
            <Input
              label={t.auth.confirmPassword}
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              required
              autoComplete="new-password"
            />

            {error && (
              <p className="text-sm text-error bg-error/10 rounded-lg px-3 py-2">
                {error}
              </p>
            )}

            <Button type="submit" loading={loading} className="w-full">
              {t.auth.createAccountBtn}
            </Button>
          </form>
        </div>

        <p className="text-center text-sm text-dark-700 dark:text-light-300 mt-4">
          {t.auth.hasAccount}{' '}
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

      {/* Footer */}
      <footer className="py-4 text-center text-xs text-dark-700 dark:text-light-300">
        &copy; {new Date().getFullYear()} {t.common.appName}. {t.common.allRightsReserved}
      </footer>
    </div>
  );
}
