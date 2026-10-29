'use client';

import { Avatar } from '@/components/ui/avatar';
import { useMe } from '@/features/auth/api';
import { LogoutButton } from '@/features/auth/components/logout-button';
import { Bell } from '@/features/notifications/components/bell';
import { cn } from '@/lib/cn';
import { ThemeToggle } from './theme-toggle';

const ROLE_LABEL = { HEAD: 'Head', MEMBER: 'Member' } as const;

/** Square tiles on the purple sidebar. */
const sidebarTile = 'h-11 w-full rounded-control bg-white/10 hover:bg-white/20';

type UserCardProps = {
  /**
   * 'sidebar': notifications, theme and log out as three square tiles above the card.
   * 'menu': the mobile menu, whose top bar already has the bell and theme toggle; just log out.
   */
  variant?: 'sidebar' | 'menu';
};

/** Signed-in user at the bottom of the sidebar, with the account actions. */
export function UserCard({ variant = 'sidebar' }: UserCardProps) {
  const { data: session } = useMe();

  return (
    <div className="flex flex-col gap-2">
      {variant === 'sidebar' && (
        <div className="grid grid-cols-3 gap-2">
          <Bell placement="sidebar" buttonClassName={sidebarTile} />
          <ThemeToggle inverse className={sidebarTile} />
          <LogoutButton inverse iconOnly className={sidebarTile} />
        </div>
      )}
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
      </div>
      {variant === 'menu' && <LogoutButton inverse className={cn(sidebarTile, 'gap-2 text-caption font-semibold')} />}
    </div>
  );
}
