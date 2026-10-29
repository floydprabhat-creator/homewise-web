'use client';

import { Pencil, Users } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { FieldError } from '@/components/ui/field-error';
import { Input } from '@/components/ui/input';
import { apiErrorMessage } from '@/lib/form-errors';
import type { HouseholdSummary } from '@/types/api';
import { useUpdateHousehold } from '../api';

/** The household's name (head can rename) and, for "Just me", turning it into a family. */
export function HouseholdCard({ household, canEdit }: { household: HouseholdSummary; canEdit: boolean }) {
  const update = useUpdateHousehold();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(household.name);
  const personal = household.type === 'PERSONAL';

  function save(input: { name: string; type?: 'FAMILY' }) {
    if (!input.name.trim()) return;
    update.mutate(input, { onSuccess: () => setEditing(false) });
  }

  if (personal && canEdit) {
    return (
      <Card className="flex flex-col gap-4">
        <div className="flex items-start gap-3">
          <span className="flex size-11 shrink-0 items-center justify-center rounded-card bg-primary-subtle text-accent">
            <Users aria-hidden className="size-[22px]" />
          </span>
          <div className="flex flex-col gap-1">
            <h2 className="text-section font-bold">Share with your family</h2>
            <p className="text-body text-muted-foreground">
              Turn {household.name} into a family to invite members. Your budget, spending and bills stay as they are.
            </p>
          </div>
        </div>
        <form
          className="flex flex-wrap items-start gap-3"
          onSubmit={(e) => {
            e.preventDefault();
            save({ name, type: 'FAMILY' });
          }}
        >
          <label htmlFor="family-name" className="sr-only">
            Family name
          </label>
          <Input id="family-name" value={name} maxLength={80} onChange={(e) => setName(e.target.value)} placeholder="e.g. Sharma family" className="max-w-xs" />
          <Button type="submit" loading={update.isPending} disabled={!name.trim()}>
            Make it a family
          </Button>
        </form>
        <FieldError message={update.isError ? apiErrorMessage(update.error) : undefined} />
      </Card>
    );
  }

  return (
    <Card className="flex flex-wrap items-center justify-between gap-4">
      {editing ? (
        <form
          className="flex flex-1 flex-wrap items-start gap-3"
          onSubmit={(e) => {
            e.preventDefault();
            save({ name });
          }}
        >
          <label htmlFor="household-name" className="sr-only">
            Family name
          </label>
          <Input id="household-name" value={name} maxLength={80} autoFocus onChange={(e) => setName(e.target.value)} className="max-w-xs" />
          <Button variant="secondary" onClick={() => (setEditing(false), setName(household.name))}>
            Cancel
          </Button>
          <Button type="submit" loading={update.isPending} disabled={!name.trim()}>
            Save
          </Button>
          <FieldError message={update.isError ? apiErrorMessage(update.error) : undefined} />
        </form>
      ) : (
        <>
          <div className="flex flex-col gap-0.5">
            <span className="text-caption text-muted-foreground">{personal ? 'Household' : 'Family'}</span>
            <span className="text-section font-bold">{household.name}</span>
          </div>
          {canEdit && (
            <Button variant="ghost" size="sm" onClick={() => setEditing(true)}>
              <Pencil aria-hidden className="size-4" />
              Rename
            </Button>
          )}
        </>
      )}
    </Card>
  );
}
