export default function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="mb-4 text-light-300 dark:text-dark-700">{icon}</div>
      <h3 className="text-lg font-semibold text-dark-800 dark:text-light-50 mb-1">{title}</h3>
      <p className="text-sm text-dark-700 dark:text-light-300 mb-4 max-w-sm">{description}</p>
      {action}
    </div>
  );
}
