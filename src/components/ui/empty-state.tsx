import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';

type EmptyStateProps = { icon: LucideIcon; title: string; description?: string; action?: ReactNode };

export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center gap-3 px-6 py-12 text-center">
      <span className="flex size-12 items-center justify-center rounded-card bg-primary-subtle text-accent">
        <Icon aria-hidden className="size-6" />
      </span>
      <p className="text-section font-bold text-foreground">{title}</p>
      {description && <p className="max-w-sm text-body text-muted-foreground">{description}</p>}
      {action}
    </div>
  );
}
