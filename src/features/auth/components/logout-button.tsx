'use client';

import { LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useLogout } from '../api';

export function LogoutButton({ inverse = false }: { inverse?: boolean }) {
  const router = useRouter();
  const logout = useLogout();

  return (
    <Button
      variant={inverse ? 'inverse' : 'secondary'}
      size="sm"
      loading={logout.isPending}
      onClick={() => logout.mutate(undefined, { onSettled: () => router.replace('/login') })}
    >
      {!logout.isPending && <LogOut aria-hidden className="size-4" />}
      Log out
    </Button>
  );
}
