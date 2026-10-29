import type { ReactNode } from 'react';

// The page renders its own header, because the stepper in it follows the page's state.
export default function OnboardingLayout({ children }: { children: ReactNode }) {
  return <div className="flex min-h-screen flex-col bg-background">{children}</div>;
}
