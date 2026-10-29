import type { ComponentProps } from 'react';

type LogoMarkProps = ComponentProps<'svg'> & {
  /** White house with a purple line, for purple backgrounds. */
  inverse?: boolean;
};

/** House with a rising trend line. Uses theme tokens, so it adapts to light and dark mode. */
export function LogoMark({ inverse = false, ...props }: LogoMarkProps) {
  return (
    <svg width={32} height={32} viewBox="0 0 32 32" aria-hidden {...props}>
      <path d="M4 14.6 16 4l12 10.6V26a3 3 0 0 1-3 3H7a3 3 0 0 1-3-3Z" fill={inverse ? '#ffffff' : 'var(--primary)'} />
      <path
        d="m9.5 22 4.5-4.5 3 3 5.5-5.5M18.5 15h4v4"
        fill="none"
        stroke={inverse ? 'var(--primary)' : 'var(--primary-foreground)'}
        strokeWidth={2.2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
