import { cn } from '@/lib/cn';

type TabsProps<T extends string> = {
  label: string;
  tabs: { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
};

/** Segmented control for switching views ("Due list" / "Manage bills"). */
export function Tabs<T extends string>({ label, tabs, value, onChange }: TabsProps<T>) {
  return (
    <div role="tablist" aria-label={label} className="flex rounded-card border border-border bg-neutral p-1">
      {tabs.map((tab) => {
        const selected = tab.value === value;
        return (
          <button
            key={tab.value}
            type="button"
            role="tab"
            aria-selected={selected}
            onClick={() => onChange(tab.value)}
            className={cn(
              'h-9 rounded-[9px] px-3.5 text-caption transition-colors',
              selected ? 'bg-card font-bold text-foreground shadow-sm' : 'font-semibold text-muted-foreground hover:text-foreground',
            )}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
