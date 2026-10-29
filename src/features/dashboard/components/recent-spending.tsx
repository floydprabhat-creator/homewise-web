import { MemberAvatar } from '@/features/household/components/member-avatar';
import { formatDate, formatINR } from '@/lib/format';
import type { DashboardResponse } from '@/types/api';

type RecentSpendingProps = { entries: DashboardResponse['recentSpending']; userId: string };

export function RecentSpending({ entries, userId }: RecentSpendingProps) {
  if (entries.length === 0) {
    return <p className="py-2 text-caption text-muted-foreground">Nothing recorded this month yet.</p>;
  }

  return (
    <ul className="flex flex-col">
      {entries.map((e) => {
        const who = e.recordedBy.id === userId ? 'You' : e.recordedBy.isFormerMember ? `${e.recordedBy.name} (former member)` : e.recordedBy.name;
        return (
          <li key={e.id} className="flex items-center gap-3 py-2">
            <MemberAvatar
              userId={e.recordedBy.id}
              name={e.recordedBy.name}
              className="size-[34px] border-0 bg-primary-subtle text-xs font-extrabold text-accent"
            />
            <div className="flex min-w-0 flex-1 flex-col">
              <span className="truncate text-sm font-semibold">{e.note ?? e.category.name}</span>
              <span className="truncate text-xs text-muted-foreground">
                {e.category.name} · {who} · {formatDate(e.date)}
              </span>
            </div>
            <span className="text-sm font-bold">{formatINR(e.amount)}</span>
          </li>
        );
      })}
    </ul>
  );
}
