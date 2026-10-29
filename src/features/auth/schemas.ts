import { z } from 'zod';

// Mirrors homewise-api/src/modules/auth/auth.schemas.ts for instant feedback. The API is the real check.
const emailSchema = z.string().trim().toLowerCase().pipe(z.email('Enter a valid email address'));

export const registerSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(80, 'Name is too long'),
  email: emailSchema,
  password: z.string().min(8, 'Password must be at least 8 characters').max(128, 'Password is too long'),
});

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required'),
});

export type RegisterValues = z.infer<typeof registerSchema>;
export type LoginValues = z.infer<typeof loginSchema>;
