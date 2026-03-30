import { ReactNode } from 'react';

export default function Card({
  children,
  className = '',
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`bg-white dark:bg-dark-800 rounded-xl border border-light-200 dark:border-dark-700 p-6 ${className}`}
    >
      {children}
    </div>
  );
}
