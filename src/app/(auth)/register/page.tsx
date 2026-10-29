import type { Metadata } from 'next';
import { AuthHeading } from '@/features/auth/components/auth-heading';
import { RegisterForm } from '@/features/auth/components/register-form';

export const metadata: Metadata = { title: 'Create account · HomeWise' };

export default function RegisterPage() {
  return (
    <>
      <AuthHeading title="Create your account" description="Track spending and bills for you or your family." />
      <RegisterForm />
    </>
  );
}
