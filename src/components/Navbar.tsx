'use client';

import { Menu, LogOut } from 'lucide-react';
import ThemeToggle from './ThemeToggle';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

export default function Navbar({ onMenuClick }: { onMenuClick: () => void }) {
  const router = useRouter();
  const supabase = createClient();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  return (
    <header className="sticky top-0 z-30 h-16 bg-white dark:bg-dark-800 border-b border-light-200 dark:border-dark-700 flex items-center justify-between px-4 lg:px-6">
      <button
        onClick={onMenuClick}
        className="lg:hidden p-2 rounded-lg hover:bg-light-100 dark:hover:bg-dark-700"
      >
        <Menu size={20} className="text-dark-800 dark:text-light-200" />
      </button>

      <div className="flex-1" />

      <div className="flex items-center gap-2">
        <ThemeToggle />
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 px-3 py-2 text-sm text-dark-700 dark:text-light-300 hover:bg-light-100 dark:hover:bg-dark-700 rounded-lg transition-colors"
        >
          <LogOut size={16} />
          <span className="hidden sm:inline">Logout</span>
        </button>
      </div>
    </header>
  );
}
