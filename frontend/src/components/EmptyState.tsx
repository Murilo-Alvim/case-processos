import { Inbox } from "lucide-react";

export function EmptyState({
  title,
  description,
  action,
  icon,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
  icon?: React.ReactNode;
}) {
  return (
    <div className="card p-10 grid place-items-center text-center animate-fade-in">
      <div className="w-14 h-14 rounded-full bg-brand-500/10 border border-brand-500/20 grid place-items-center text-brand-300 mb-4">
        {icon ?? <Inbox className="w-6 h-6" />}
      </div>
      <h3 className="text-lg font-semibold text-ink">{title}</h3>
      {description && (
        <p className="text-sm text-muted mt-1 max-w-md">{description}</p>
      )}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
