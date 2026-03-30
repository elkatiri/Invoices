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

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();
  const { t } = useI18n();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    router.push('/dashboard');
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
          <h1 className="text-xl font-semibold text-dark-800 dark:text-light-50">
            {t.auth.welcomeBack}
          </h1>
          <p className="text-sm text-dark-700 dark:text-light-300 mt-1">
            {t.auth.signInToAccount}
          </p>
        </div>

        <div className="bg-white dark:bg-dark-800 rounded-xl border border-light-200 dark:border-dark-700 p-6 shadow-sm">
          <form onSubmit={handleLogin} className="space-y-4">
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
              autoComplete="current-password"
            />

            {error && (
              <p className="text-sm text-error bg-error/10 rounded-lg px-3 py-2">
                {error}
              </p>
            )}

            <Button type="submit" loading={loading} className="w-full">
              {t.auth.signInBtn}
            </Button>

            <div className="text-center">
              <Link
                href="/forgot-password"
                className="text-sm text-orange-brand hover:underline font-medium"
              >
                {t.auth.forgotPassword}
              </Link>
            </div>
          </form>
        </div>

        <p className="text-center text-sm text-dark-700 dark:text-light-300 mt-4">
          {t.auth.noAccount}{' '}
          <Link
            href="/register"
            className="text-orange-brand hover:underline font-medium"
          >
            {t.auth.signUp}
          </Link>
        </p>
      </div>
      </div>

      {/* Footer */}
      <footer className="py-4 text-center text-xs text-dark-700 dark:text-light-300">
        &copy; {new Date().getFullYear()} {t.common.appName}. {t.common.allRightsReserved}
      </footer>
    </div>
  );
}
