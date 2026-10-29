'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Spinner } from '@/components/ui/spinner';
import { useMe } from '@/features/auth/api';
import { useRecommendation } from '@/features/budget/api';
import { OnboardingFlow } from '@/features/budget/components/onboarding-flow';

export default function OnboardingPage() {
  const router = useRouter();
  const { data: session } = useMe();
  const { data: recommendation } = useRecommendation();
  const done = session && !session.needsOnboarding;

  // Members who joined by invite, and heads who already finished, never see onboarding.
  useEffect(() => {
    if (done) router.replace('/dashboard');
  }, [done, router]);

  if (!session || !recommendation || done) {
    return (
      <div className="flex flex-1 items-center justify-center text-accent">
        <Spinner className="size-6" />
      </div>
    );
  }

  return <OnboardingFlow userId={session.user.id} recommendation={recommendation} />;
}
