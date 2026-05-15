interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: React.ReactNode;
  icon?: React.ReactNode;
}

export function PageHeader({ title, description, actions, icon }: PageHeaderProps) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
      <div className="flex items-center gap-3">
        {icon && (
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-brand-500/20 to-brand-700/10 border border-brand-500/20 grid place-items-center text-brand-300">
            {icon}
          </div>
        )}
        <div>
          <h1 className="text-2xl font-bold text-ink tracking-tight">{title}</h1>
          {description && (
            <p className="text-sm text-muted mt-0.5 max-w-2xl">{description}</p>
          )}
        </div>
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}
