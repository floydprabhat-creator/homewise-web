import type { ReactNode } from 'react';

/** Horizontal rule, optionally with a centered label ("New here?"). */
export function Divider({ children }: { children?: ReactNode }) {
  if (!children) return <hr className="border-border" />;

  return (
    <div className="flex items-center gap-4 text-body text-muted-foreground">
      <span className="h-px flex-1 bg-border" />
      {children}
      <span className="h-px flex-1 bg-border" />
    </div>
  );
}
