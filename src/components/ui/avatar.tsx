import { cn } from '@/lib/cn';

export function initials(name: string) {
  const parts = name.trim().split(/\s+/);
  const first = parts[0]?.[0] ?? '';
  const last = parts.length > 1 ? (parts[parts.length - 1]?.[0] ?? '') : '';
  return (first + last).toUpperCase();
}

type AvatarProps = {
  name: string;
  size?: 'sm' | 'md';
  /** White circle with purple text, for the purple sidebar. */
  inverse?: boolean;
  className?: string;
};

export function Avatar({ name, size = 'sm', inverse = false, className }: AvatarProps) {
  return (
    <span
      aria-hidden
      className={cn(
        'inline-flex shrink-0 items-center justify-center rounded-full font-bold',
        size === 'sm' ? 'size-9 text-caption' : 'size-11 text-body',
        inverse ? 'bg-white text-primary' : 'border border-border bg-neutral text-foreground',
        className,
      )}
    >
      {initials(name)}
    </span>
  );
}
