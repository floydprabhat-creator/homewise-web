import { TriangleAlert } from 'lucide-react';
import { Alert } from '@/components/ui/alert';
import type { BudgetUsage } from '@/types/api';
import { activeWarnings } from '../usage';

/** Active 80% / 100% warnings for the month; nothing when everything is on track. */
export function WarningsBanner({ usage, suffix }: { usage: BudgetUsage; suffix?: string }) {
  const warnings = activeWarnings(usage);
  if (warnings.length === 0) return null;
  const exceeded = warnings.some((w) => w.state === 'EXCEEDED');

  return (
    <Alert tone={exceeded ? 'danger' : 'warning'} icon={TriangleAlert}>
      <ul className="flex flex-col gap-1">
        {warnings.map((w) => (
          <li key={w.scope}>
            <b>{w.text}</b> {w.detail}
            {suffix && ` ${suffix}`}
          </li>
        ))}
      </ul>
    </Alert>
  );
}
