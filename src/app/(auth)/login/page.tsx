import type { Metadata } from 'next';
import { AuthHeading } from '@/features/auth/components/auth-heading';
import { LoginForm } from '@/features/auth/components/login-form';

export const metadata: Metadata = { title: 'Log in · HomeWise' };

export default function LoginPage() {
  return (
    <>
      <AuthHeading title="Welcome back" description="Log in to see your household's month." />
      <LoginForm />
    </>
  );
}
