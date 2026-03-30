'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  FileText,
  UserCircle,
  X,
} from 'lucide-react';

const links = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/dashboard/clients', label: 'Clients', icon: Users },
  { href: '/dashboard/invoices', label: 'Invoices', icon: FileText },
  { href: '/dashboard/profile', label: 'Profile', icon: UserCircle },
];

export default function Sidebar({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const pathname = usePathname();

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed top-0 left-0 z-50 h-full w-64 bg-white dark:bg-dark-800 border-r border-light-200 dark:border-dark-700 transform transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static lg:z-auto ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Logo */}
        <div className="flex items-center justify-between h-16 px-6 border-b border-light-200 dark:border-dark-700">
          <Link href="/dashboard" className="flex items-center gap-2">
            <FileText className="text-orange-brand" size={24} />
            <span className="text-xl font-bold text-dark-800 dark:text-light-50">
              InVoices
            </span>
          </Link>
          <button onClick={onClose} className="lg:hidden text-dark-700 dark:text-light-300">
            <X size={20} />
          </button>
        </div>

        {/* Nav */}
        <nav className="mt-6 px-3 space-y-1">
          {links.map(({ href, label, icon: Icon }) => {
            const active =
              href === '/dashboard'
                ? pathname === '/dashboard'
                : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                onClick={onClose}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  active
                    ? 'bg-orange-brand/10 text-orange-brand'
                    : 'text-dark-700 dark:text-light-300 hover:bg-light-100 dark:hover:bg-dark-700'
                }`}
              >
                <Icon size={18} />
                {label}
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
