import { Badge, type BadgeTone } from '@/components/ui/badge';
import { cn } from '@/lib/cn';
import type { DisplayStatus } from '@/types/constants';

export const STATUS_INFO: Record<DisplayStatus, { label: string; tone: BadgeTone }> = {
  OVERDUE: { label: 'Overdue', tone: 'danger' },
  DUE_SOON: { label: 'Due soon', tone: 'warning' },
  UPCOMING: { label: 'Upcoming', tone: 'neutral' },
  PAID: { label: 'Paid', tone: 'success' },
};

/** Colour plus a word: Overdue red, Due soon amber, Upcoming grey, Paid green. */
export function StatusBadge({ status, className }: { status: DisplayStatus; className?: string }) {
  const { label, tone } = STATUS_INFO[status];
  return (
    <Badge tone={tone} className={cn('h-[22px] px-2.5 text-[11px] font-bold', className)}>
      {label}
    </Badge>
  );
}
