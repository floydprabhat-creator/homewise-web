import { Badge, type BadgeTone } from '@/components/ui/badge';
import { formatINR, formatMonth } from '@/lib/format';
import type { DashboardResponse } from '@/types/api';
import { BUCKET_INFO, type Bucket } from '@/types/constants';

/** Spending more is a caution; saving more is good news. */
function changeBadge(changePercent: number | null, bucket?: Bucket): { text: string; tone: BadgeTone } {
  if (changePercent === null) return { text: 'New', tone: 'neutral' };
  if (changePercent === 0) return { text: 'No change', tone: 'neutral' };
  const up = changePercent > 0;
  const good = bucket === 'SAVINGS' ? up : !up;
  return { text: `${up ? '▲' : '▼'} ${Math.abs(changePercent).toFixed(1)}%`, tone: good ? 'success' : 'warning' };
}

type MonthComparisonProps = { month: string; comparison: DashboardResponse['comparison'] };

export function MonthComparison({ month, comparison }: MonthComparisonProps) {
  const current = formatMonth(month).split(' ')[0];

  if (!comparison) {
    return (
      <>
        <h2 className="text-base font-bold">This month vs last month</h2>
        <p className="text-caption text-muted-foreground">No data for last month yet. The comparison starts next month.</p>
      </>
    );
  }

  const previous = formatMonth(comparison.previousMonth).split(' ')[0];
  const rows = [
    { label: 'Total', ...comparison.total, bucket: undefined },
    ...comparison.buckets.map((b) => ({ label: BUCKET_INFO[b.bucket].label, ...b })),
  ];

  return (
    <>
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-base font-bold">
          {current} vs {previous}
        </h2>
        <span className="text-caption text-muted-foreground">
          Total {formatINR(comparison.total.current)} vs {formatINR(comparison.total.previous)}
        </span>
      </div>
      <table className="w-full text-sm">
        <caption className="sr-only">
          Spending in {current} compared with {previous}
        </caption>
        <tbody>
          {rows.map((r) => {
            const badge = changeBadge(r.changePercent, r.bucket);
            return (
              <tr key={r.label}>
                <th scope="row" className="w-24 py-1.5 text-left font-semibold">
                  {r.label}
                </th>
                <td className="py-1.5 text-muted-foreground">
                  {formatINR(r.current)} vs {formatINR(r.previous)}
                </td>
                <td className="py-1.5 text-right">
                  <Badge tone={badge.tone} className="h-6 px-2.5 text-xs font-bold">
                    {badge.text}
                  </Badge>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </>
  );
}
