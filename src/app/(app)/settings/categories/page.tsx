'use client';

import { useState } from 'react';
import { Alert } from '@/components/ui/alert';
import { Card } from '@/components/ui/card';
import { Chip } from '@/components/ui/chip';
import { PageHeader } from '@/components/ui/page-header';
import { Spinner } from '@/components/ui/spinner';
import { useMe } from '@/features/auth/api';
import { useCategories } from '@/features/categories/api';
import { CategoryForm } from '@/features/categories/components/category-form';
import { CategoryList } from '@/features/categories/components/category-list';
import { apiErrorMessage } from '@/lib/form-errors';

export default function CategoriesPage() {
  const { data: session } = useMe();
  const [showArchived, setShowArchived] = useState(false);
  const categories = useCategories({ includeArchived: showArchived });
  const isHead = session?.role === 'HEAD';

  return (
    <>
      <PageHeader
        title="Categories"
        description={
          isHead
            ? 'Add your own categories, rename any, and archive the ones you no longer use.'
            : 'The categories your household records spending under.'
        }
        actions={
          <Chip pressed={showArchived} onClick={() => setShowArchived((v) => !v)}>
            Show archived
          </Chip>
        }
      />
      <div className="flex flex-col gap-6">
        {isHead && (
          <Card>
            <CategoryForm />
          </Card>
        )}
        {categories.error ? (
          <Alert>{apiErrorMessage(categories.error)}</Alert>
        ) : !categories.data ? (
          <div className="flex justify-center py-16 text-accent">
            <Spinner className="size-6" />
          </div>
        ) : (
          <CategoryList categories={categories.data} canEdit={isHead} />
        )}
      </div>
    </>
  );
}
