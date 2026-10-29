'use client';

import { PageHeader } from '@/components/ui/page-header';
import { Spinner } from '@/components/ui/spinner';
import { useMe } from '@/features/auth/api';
import { PasswordForm } from '@/features/profile/components/password-form';
import { ProfileDetails } from '@/features/profile/components/profile-details';

export default function ProfilePage() {
  const { data: session } = useMe();

  return (
    <>
      <PageHeader title="Profile" description="Your photo, name and password." />
      {!session ? (
        <div className="flex justify-center py-16 text-accent">
          <Spinner className="size-6" />
        </div>
      ) : (
        <div className="grid items-start gap-6 xl:grid-cols-2">
          <ProfileDetails session={session} />
          <PasswordForm email={session.user.email} />
        </div>
      )}
    </>
  );
}
