'use client';

import { Alert } from '@/components/ui/alert';
import { Card, CardTitle } from '@/components/ui/card';
import { PageHeader } from '@/components/ui/page-header';
import { Spinner } from '@/components/ui/spinner';
import { useMe } from '@/features/auth/api';
import { useHousehold, useInvites } from '@/features/household/api';
import { HouseholdCard } from '@/features/household/components/household-card';
import { InviteForm } from '@/features/household/components/invite-form';
import { MembersList } from '@/features/household/components/members-list';
import { PendingInvites } from '@/features/household/components/pending-invites';
import { RolesCard } from '@/features/household/components/roles-card';
import { apiErrorMessage } from '@/lib/form-errors';

/** Members see this page read-only; head-only controls are hidden by role (the API checks again). */
export default function FamilyPage() {
  const { data: session } = useMe();
  const household = useHousehold();
  const isHead = session?.role === 'HEAD';
  const isFamily = household.data?.household.type === 'FAMILY';
  const invites = useInvites({ enabled: isHead && isFamily });

  return (
    <>
      <PageHeader
        title="Family"
        description={isHead ? 'Invite family members and manage who is in your household.' : 'The people who share this budget.'}
      />
      {household.error ? (
        <Alert>{apiErrorMessage(household.error)}</Alert>
      ) : !household.data || !session ? (
        <div className="flex justify-center py-16 text-accent">
          <Spinner className="size-6" />
        </div>
      ) : (
        // Two columns on wide screens: who is in the family on the left, adding people on the right.
        <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_400px]">
          <div className="flex min-w-0 flex-col gap-6">
            <HouseholdCard household={household.data.household} canEdit={isHead} />
            <MembersList members={household.data.members} userId={session.user.id} canRemove={isHead} />
          </div>
          <div className="flex flex-col gap-6 xl:sticky xl:top-8">
            {isHead && isFamily && (
              <Card className="flex flex-col gap-4">
                <CardTitle>Invite a member</CardTitle>
                <InviteForm />
                <div className="flex flex-col gap-2 border-t border-border pt-4">
                  <span className="text-caption font-bold tracking-wide text-muted-foreground uppercase">Pending invites</span>
                  {invites.data ? <PendingInvites invites={invites.data} /> : <Spinner className="text-accent" />}
                </div>
              </Card>
            )}
            <RolesCard />
          </div>
        </div>
      )}
    </>
  );
}
