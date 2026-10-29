'use client';

import { User, Users } from 'lucide-react';
import { cn } from '@/lib/cn';
import type { HouseholdType } from '@/types/constants';

const OPTIONS: { value: HouseholdType; title: string; description: string; icon: typeof User }[] = [
  { value: 'PERSONAL', title: 'Just me', description: 'Track your own spending and bills.', icon: User },
  {
    value: 'FAMILY',
    title: 'My family',
    description: 'Share one budget, split bills and invite family members.',
    icon: Users,
  },
];

/** "Just me" / "My family" as a radio group of cards. */
export function ModeChoice({ value, onChange }: { value: HouseholdType | null; onChange: (v: HouseholdType) => void }) {
  return (
    <fieldset className="grid gap-4 sm:grid-cols-2">
      <legend className="sr-only">Who is this budget for?</legend>
      {OPTIONS.map(({ value: option, title, description, icon: Icon }) => {
        const selected = value === option;
        return (
          <label
            key={option}
            className={cn(
              'flex cursor-pointer flex-col gap-3 rounded-2xl border-[1.5px] bg-card p-6 transition-colors',
              'has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-ring',
              selected ? 'border-accent bg-primary-subtle' : 'border-border hover:bg-neutral',
            )}
          >
            <input
              type="radio"
              name="mode"
              value={option}
              checked={selected}
              onChange={() => onChange(option)}
              className="sr-only"
            />
            <span className={cn('flex size-11 items-center justify-center rounded-card', selected ? 'bg-primary text-primary-foreground' : 'bg-primary-subtle text-accent')}>
              <Icon aria-hidden className="size-[22px]" />
            </span>
            <span className="text-section font-bold">{title}</span>
            <span className="text-body text-muted-foreground">{description}</span>
          </label>
        );
      })}
    </fieldset>
  );
}
