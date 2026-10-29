import { z } from 'zod';
import { BUCKETS } from '@/types/constants';

// Mirrors homewise-api/src/modules/categories/categories.schemas.ts.
export const categoryNameSchema = z.string().trim().min(1, 'Name is required').max(40, 'Keep it under 40 characters');

export const createCategorySchema = z.object({
  name: categoryNameSchema,
  bucket: z.enum(BUCKETS),
});

export type CreateCategoryValues = z.infer<typeof createCategorySchema>;
