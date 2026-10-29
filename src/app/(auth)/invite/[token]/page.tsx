import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import { AcceptInvite } from '@/features/household/components/accept-invite';
import { SESSION_COOKIE } from '@/types/constants';

export const metadata: Metadata = { title: 'Join a family · HomeWise' };

export default async function InvitePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  // The cookie is httpOnly, so the client can't see it; the page tells it whether to load the session.
  const hasSession = (await cookies()).has(SESSION_COOKIE);
  return <AcceptInvite token={token} hasSession={hasSession} />;
}
