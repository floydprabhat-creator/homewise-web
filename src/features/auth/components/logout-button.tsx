'use client';

import { LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useLogout } from '../api';

type LogoutButtonProps = {
  inverse?: boolean;
  /** Square icon tile (sidebar); the label moves to aria-label and the tooltip. */
  iconOnly?: boolean;
  className?: string;
};

export function LogoutButton({ inverse = false, iconOnly = false, className }: LogoutButtonProps) {
  const router = useRouter();
  const logout = useLogout();

  return (
    <Button
      variant={inverse ? 'inverse' : 'secondary'}
      size={iconOnly ? 'icon' : 'sm'}
      aria-label={iconOnly ? 'Log out' : undefined}
      title={iconOnly ? 'Log out' : undefined}
      loading={logout.isPending}
      onClick={() => logout.mutate(undefined, { onSettled: () => router.replace('/login') })}
      className={className}
    >
      {!logout.isPending && <LogOut aria-hidden className={iconOnly ? 'size-5' : 'size-4'} />}
      {!iconOnly && 'Log out'}
    </Button>
  );
}
