import type { ReactNode } from 'react';

type PageHeaderProps = {
  title: string;
  description?: ReactNode;
  actions?: ReactNode;
};

export function PageHeader({ title, description, actions }: PageHeaderProps) {
  return (
    <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
      <div className="flex flex-col gap-1">
        <h1 className="text-title font-bold tracking-tight text-foreground">{title}</h1>
        {description && <p className="text-body text-muted-foreground">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-3">{actions}</div>}
    </div>
  );
}
