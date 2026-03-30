'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FileText } from 'lucide-react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { useI18n } from '@/lib/i18n/context';

export default function UpdatePasswordPage() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const router = useRouter();
  const supabase = createClient();
  const { t } = useI18n();

  const handleUpdate = async (e: React.FormEvent) => {
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

    const { error: updateError } = await supabase.auth.updateUser({
      password,
    });

    if (updateError) {
      setError(updateError.message);
      setLoading(false);
      return;
    }

    setLoading(false);
    setDone(true);
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
          {!done && (
            <>
              <h1 className="text-xl font-semibold text-dark-800 dark:text-light-50">
                {t.auth.setNewPassword}
              </h1>
              <p className="text-sm text-dark-700 dark:text-light-300 mt-1">
                {t.auth.enterNewPassword}
              </p>
            </>
          )}
        </div>

        {done ? (
          <div className="bg-white dark:bg-dark-800 rounded-xl border border-light-200 dark:border-dark-700 p-8 shadow-sm text-center">
            <div className="w-14 h-14 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-4">
              <svg className="w-7 h-7 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-dark-800 dark:text-light-50 mb-2">
              {t.auth.passwordUpdated}
            </h2>
            <p className="text-sm text-dark-700 dark:text-light-300 mb-4">
              {t.auth.passwordChangedSuccess}
            </p>
            <Button onClick={() => router.push('/dashboard')} className="w-full">
              {t.auth.goToDashboard}
            </Button>
          </div>
        ) : (
          <div className="bg-white dark:bg-dark-800 rounded-xl border border-light-200 dark:border-dark-700 p-6 shadow-sm">
            <form onSubmit={handleUpdate} className="space-y-4">
              <Input
                label={t.auth.newPassword}
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                autoComplete="new-password"
              />
              <Input
                label={t.auth.confirmNewPassword}
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
                {t.auth.updatePasswordBtn}
              </Button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
