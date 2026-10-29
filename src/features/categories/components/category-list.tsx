'use client';

import { Archive, ArchiveRestore, Pencil } from 'lucide-react';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardTitle } from '@/components/ui/card';
import { FieldError } from '@/components/ui/field-error';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/cn';
import { apiErrorMessage } from '@/lib/form-errors';
import type { Category } from '@/types/api';
import { BUCKETS, BUCKET_INFO } from '@/types/constants';
import { useUpdateCategory } from '../api';
import { categoryNameSchema } from '../schemas';

/** Categories grouped by bucket. Heads can rename any, and archive or restore their own. */
export function CategoryList({ categories, canEdit }: { categories: Category[]; canEdit: boolean }) {
  return (
    <div className="grid gap-5 lg:grid-cols-3">
      {BUCKETS.map((bucket) => {
        const items = categories.filter((c) => c.bucket === bucket);
        return (
          <Card key={bucket} className="p-0">
            <div className="px-6 pt-6">
              <CardTitle>
                <span className="flex items-center gap-2.5">
                  <span aria-hidden className={cn('size-3 rounded', BUCKET_INFO[bucket].dot)} />
                  {BUCKET_INFO[bucket].label}
                </span>
              </CardTitle>
            </div>
            <ul className="divide-y divide-border border-t border-border">
              {items.map((c) => (
                <CategoryRow key={c.id} category={c} canEdit={canEdit} />
              ))}
              {items.length === 0 && <li className="px-6 py-4 text-caption text-muted-foreground">No categories</li>}
            </ul>
          </Card>
        );
      })}
    </div>
  );
}

function CategoryRow({ category, canEdit }: { category: Category; canEdit: boolean }) {
  const update = useUpdateCategory();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(category.name);
  const [error, setError] = useState<string>();
  const archived = Boolean(category.archivedAt);

  function rename() {
    const parsed = categoryNameSchema.safeParse(name);
    if (!parsed.success) return setError(parsed.error.issues[0]?.message);
    if (parsed.data === category.name) return setEditing(false);
    update.mutate(
      { id: category.id, name: parsed.data },
      { onSuccess: () => setEditing(false), onError: (e) => setError(apiErrorMessage(e)) },
    );
  }

  if (editing) {
    return (
      <li className="flex flex-col gap-2 px-6 py-3">
        <form
          className="flex items-center gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            rename();
          }}
        >
          <Input
            aria-label={`New name for ${category.name}`}
            value={name}
            maxLength={40}
            autoFocus
            aria-invalid={error ? true : undefined}
            onChange={(e) => {
              setName(e.target.value);
              setError(undefined);
            }}
            onKeyDown={(e) => e.key === 'Escape' && setEditing(false)}
            className="h-9"
          />
          <Button type="submit" size="sm" loading={update.isPending}>
            Save
          </Button>
          <Button variant="secondary" size="sm" onClick={() => setEditing(false)}>
            Cancel
          </Button>
        </form>
        <FieldError message={error} />
      </li>
    );
  }

  return (
    // Archived rows are tinted red, with a red badge, so they stand apart when "Show archived" is on.
    <li className={cn('flex min-h-14 flex-wrap items-center gap-x-3 gap-y-1 px-6 py-2', archived && 'bg-danger-subtle')}>
      <span className={cn('flex-1 text-body', archived && 'text-danger line-through')}>{category.name}</span>
      {category.isSystem && (
        <Badge shape="tag" tone="neutral">
          Default
        </Badge>
      )}
      {archived && (
        // Solid red: the subtle red badge would vanish against the red-tinted row.
        <Badge shape="tag" tone="danger" className="bg-danger text-danger-foreground">
          Archived
        </Badge>
      )}
      {canEdit && (
        <span className="flex items-center">
          <Button
            variant="ghost"
            size="icon"
            className="size-9"
            aria-label={`Rename ${category.name}`}
            title="Rename"
            onClick={() => {
              setName(category.name);
              setError(undefined);
              setEditing(true);
            }}
          >
            <Pencil aria-hidden className="size-4" />
          </Button>
          {!category.isSystem && (
            <Button
              variant="ghost"
              size="icon"
              className="size-9"
              aria-label={archived ? `Restore ${category.name}` : `Archive ${category.name}`}
              title={archived ? 'Restore' : 'Archive'}
              loading={update.isPending}
              onClick={() => update.mutate({ id: category.id, archived: !archived }, { onError: (e) => setError(apiErrorMessage(e)) })}
            >
              {!update.isPending && (archived ? <ArchiveRestore aria-hidden className="size-4" /> : <Archive aria-hidden className="size-4" />)}
            </Button>
          )}
        </span>
      )}
      {error && (
        <p role="alert" className="w-full text-xs font-medium text-danger">
          {error}
        </p>
      )}
    </li>
  );
}
