'use client';

import { Avatar } from '@/components/ui/avatar';
import { useMe } from '@/features/auth/api';
import { LogoutButton } from '@/features/auth/components/logout-button';
import { ThemeToggle } from './theme-toggle';

const ROLE_LABEL = { HEAD: 'Head', MEMBER: 'Member' } as const;

/** Signed-in user at the bottom of the sidebar, with the theme toggle and log out. */
export function UserCard({ showThemeToggle = true }: { showThemeToggle?: boolean }) {
  const { data: session } = useMe();

  return (
    <div className="rounded-card bg-white/10 p-3">
      {session ? (
        <div className="flex items-center gap-3">
          <Avatar name={session.user.name} size="md" inverse />
          <div className="min-w-0">
            <p className="truncate text-body font-bold text-white">{session.user.name}</p>
            <p className="truncate text-caption text-white/80">
              {session.role && session.household
                ? `${ROLE_LABEL[session.role]} · ${session.household.name}`
                : session.user.email}
            </p>
          </div>
        </div>
      ) : (
        <div className="h-11" />
      )}
      <div className="mt-3 flex items-center justify-between border-t border-white/15 pt-3">
        {showThemeToggle ? <ThemeToggle inverse /> : <span />}
        <LogoutButton inverse />
      </div>
    </div>
  );
}
