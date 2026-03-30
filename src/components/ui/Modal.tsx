'use client';

import {
  Dialog,
  DialogBackdrop,
  DialogPanel,
  DialogTitle,
} from '@headlessui/react';
import { X } from 'lucide-react';
import { ReactNode } from 'react';

export default function Modal({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}) {
  return (
    <Dialog open={open} onClose={onClose} className="relative z-50">
      <DialogBackdrop className="fixed inset-0 bg-black/40 backdrop-blur-sm" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <DialogPanel className="w-full max-w-lg bg-white dark:bg-dark-800 rounded-xl border border-light-200 dark:border-dark-700 shadow-xl">
          <div className="flex items-center justify-between px-6 py-4 border-b border-light-200 dark:border-dark-700">
            <DialogTitle className="text-lg font-semibold text-dark-800 dark:text-light-50">
              {title}
            </DialogTitle>
            <button
              onClick={onClose}
              className="p-1 rounded-lg hover:bg-light-100 dark:hover:bg-dark-700 transition-colors"
            >
              <X size={18} className="text-dark-700 dark:text-light-300" />
            </button>
          </div>
          <div className="p-6">{children}</div>
        </DialogPanel>
      </div>
    </Dialog>
  );
}
