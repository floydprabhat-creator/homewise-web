import type { Metadata } from 'next';
import { AuthHeading } from '@/features/auth/components/auth-heading';
import { ForgotPasswordForm } from '@/features/auth/components/forgot-password-form';

export const metadata: Metadata = { title: 'Reset password · HomeWise' };

export default async function ForgotPasswordPage({ searchParams }: { searchParams: Promise<{ email?: string }> }) {
  const { email } = await searchParams;
  return (
    <>
      <AuthHeading title="Reset your password" description="We'll email you a 6-digit code to set a new one." />
      <ForgotPasswordForm defaultEmail={typeof email === 'string' ? email : ''} />
    </>
  );
}
