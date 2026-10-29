'use client';

import { Card } from '@/components/ui/card';
import { PageHeader } from '@/components/ui/page-header';
import { useMe } from '@/features/auth/api';

// Placeholder until the dashboard feature (F8). Layout reference: requirements/design/06-dashboard.png.
export default function DashboardPage() {
  const { data: session } = useMe();
  const firstName = session?.user.name.split(' ')[0];

  return (
    <>
      <PageHeader title="Dashboard" description={firstName && `Welcome, ${firstName}.`} />
      <Card>
        <p className="text-muted-foreground">Your budget overview will appear here.</p>
      </Card>
    </>
  );
}
