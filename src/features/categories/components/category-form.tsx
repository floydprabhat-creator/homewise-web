'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Plus } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Alert } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Field } from '@/components/ui/field';
import { FormField } from '@/components/ui/form-field';
import { Select } from '@/components/ui/select';
import { applyApiErrors } from '@/lib/form-errors';
import { BUCKETS, BUCKET_INFO } from '@/types/constants';
import { useCreateCategory } from '../api';
import { createCategorySchema, type CreateCategoryValues } from '../schemas';

export function CategoryForm() {
  const create = useCreateCategory();
  const [formError, setFormError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm<CreateCategoryValues>({
    resolver: zodResolver(createCategorySchema),
    defaultValues: { name: '', bucket: 'LIFESTYLE' },
  });

  const onSubmit = handleSubmit((values) => {
    setFormError(null);
    create.mutate(values, {
      onSuccess: () => reset({ name: '', bucket: values.bucket }),
      onError: (error) => setFormError(applyApiErrors(error, setError, ['name', 'bucket'])),
    });
  });

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-4">
      {formError && <Alert>{formError}</Alert>}
      <div className="grid items-start gap-4 sm:grid-cols-[1fr_12rem_auto]">
        <FormField id="category-name" label="New category" placeholder="e.g. Pet care" error={errors.name?.message} {...register('name')} />
        <Field id="category-bucket" label="Bucket" error={errors.bucket?.message}>
          {(control) => (
            <Select {...control} {...register('bucket')}>
              {BUCKETS.map((b) => (
                <option key={b} value={b}>
                  {BUCKET_INFO[b].label}
                </option>
              ))}
            </Select>
          )}
        </Field>
        <Button type="submit" loading={create.isPending} className="sm:mt-[1.625rem]">
          {!create.isPending && <Plus aria-hidden className="size-4" />}
          Add category
        </Button>
      </div>
    </form>
  );
}
