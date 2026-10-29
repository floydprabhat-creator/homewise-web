'use client';

import { Avatar } from '@/components/ui/avatar';
import { useHousehold } from '../api';

type MemberAvatarProps = { userId: string | null | undefined; name: string; className?: string };

/** A household member's photo by user id, from the cached household; initials for anyone else. */
export function MemberAvatar({ userId, name, className }: MemberAvatarProps) {
  const { data } = useHousehold();
  const src = userId ? data?.members.find((m) => m.userId === userId)?.avatarUrl : null;
  return <Avatar name={name} src={src} className={className} />;
}
