'use client';

import { useState } from 'react';
import { cn } from '@/lib/cn';

export function initials(name: string) {
  const parts = name.trim().split(/\s+/);
  const first = parts[0]?.[0] ?? '';
  const last = parts.length > 1 ? (parts[parts.length - 1]?.[0] ?? '') : '';
  return (first + last).toUpperCase();
}

const sizes = { sm: 'size-9 text-caption', md: 'size-11 text-body', lg: 'size-24 text-2xl' } as const;

type AvatarProps = {
  name: string;
  /** Profile photo; initials are shown when it's missing or fails to load. */
  src?: string | null;
  size?: keyof typeof sizes;
  /** White circle with purple text, for the purple sidebar. */
  inverse?: boolean;
  className?: string;
};

export function Avatar({ name, src, size = 'sm', inverse = false, className }: AvatarProps) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const showPhoto = Boolean(src) && src !== failedSrc;

  return (
    <span
      aria-hidden
      className={cn(
        'inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full font-bold',
        sizes[size],
        inverse ? 'bg-white text-primary' : 'border border-border bg-neutral text-foreground',
        className,
      )}
    >
      {showPhoto ? (
        // eslint-disable-next-line @next/next/no-img-element -- served through a short-lived signed URL; next/image would cache it
        <img src={src!} alt="" className="size-full object-cover" onError={() => setFailedSrc(src!)} />
      ) : (
        initials(name)
      )}
    </span>
  );
}
