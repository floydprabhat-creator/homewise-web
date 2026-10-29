'use client';

import { Search } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Chip } from '@/components/ui/chip';
import { Select } from '@/components/ui/select';
import { useHousehold } from '@/features/household/api';
import type { SpendingFilters as Filters } from '@/types/api';
import { BUCKETS, BUCKET_INFO } from '@/types/constants';

type SpendingFiltersProps = {
  filters: Filters;
  onChange: (patch: Partial<Filters>) => void;
};

export function SpendingFilters({ filters, onChange }: SpendingFiltersProps) {
  const { data: household } = useHousehold();
  const [search, setSearch] = useState(filters.q ?? '');

  // Debounce typing by 300 ms before it reaches the URL (and the API).
  useEffect(() => {
    const value = search.trim() || undefined;
    if (value === filters.q) return;
    const timer = setTimeout(() => onChange({ q: value }), 300);
    return () => clearTimeout(timer);
  }, [search, filters.q, onChange]);

  return (
    <div className="flex flex-col gap-3.5">
      <div className="flex flex-wrap items-center gap-2.5">
        <div className="flex h-11 min-w-60 flex-1 items-center gap-2 rounded-control border border-border bg-card px-3 focus-within:border-focus-border focus-within:shadow-[0_0_0_3px_var(--focus-ring)]">
          <Search aria-hidden className="size-[18px] text-muted-foreground" />
          <label htmlFor="spending-search" className="sr-only">
            Search spending
          </label>
          <input
            id="spending-search"
            type="search"
            placeholder="Search notes or categories"
            value={search}
            maxLength={100}
            onChange={(e) => setSearch(e.target.value)}
            className="min-w-0 flex-1 bg-transparent text-sm font-medium outline-none placeholder:font-normal placeholder:text-muted-foreground"
          />
        </div>
        {household && household.members.length > 1 && (
          <>
            <label htmlFor="spending-member" className="sr-only">
              Recorded by
            </label>
            <Select
              id="spending-member"
              value={filters.recordedBy ?? ''}
              onChange={(e) => onChange({ recordedBy: e.target.value || undefined })}
              className="w-auto border text-caption font-semibold"
            >
              <option value="">All members</option>
              {household.members.map((m) => (
                <option key={m.userId} value={m.userId}>
                  {m.name}
                </option>
              ))}
            </Select>
          </>
        )}
        <Chip
          pressed={Boolean(filters.hasAttachment)}
          onClick={() => onChange({ hasAttachment: filters.hasAttachment ? undefined : true })}
          className="h-11 rounded-control border"
        >
          Has attachment
        </Chip>
      </div>

      <div role="group" aria-label="Bucket" className="flex flex-wrap gap-2">
        <Chip pressed={!filters.bucket} onClick={() => onChange({ bucket: undefined })}>
          All buckets
        </Chip>
        {BUCKETS.map((b) => (
          <Chip key={b} pressed={filters.bucket === b} onClick={() => onChange({ bucket: b })}>
            {BUCKET_INFO[b].label}
          </Chip>
        ))}
      </div>
    </div>
  );
}
