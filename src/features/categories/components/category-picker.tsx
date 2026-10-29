import type { ComponentProps } from 'react';
import { Select } from '@/components/ui/select';
import type { Category } from '@/types/api';
import { BUCKETS, BUCKET_INFO } from '@/types/constants';

type CategoryPickerProps = Omit<ComponentProps<'select'>, 'children'> & {
  categories: Category[];
  /** Keep an archived category selectable when editing an entry that already uses it. */
  current?: { id: string; name: string; bucket: Category['bucket'] };
};

/** A select with one group per bucket. Archived categories are excluded unless they're the current value. */
export function CategoryPicker({ categories, current, ...props }: CategoryPickerProps) {
  const options = categories.filter((c) => !c.archivedAt || c.id === current?.id);
  if (current && !options.some((c) => c.id === current.id)) {
    options.push({ ...current, isSystem: false, archivedAt: 'archived' });
  }

  return (
    <Select {...props}>
      <option value="" disabled>
        Pick a category
      </option>
      {BUCKETS.map((bucket) => (
        <optgroup key={bucket} label={BUCKET_INFO[bucket].label}>
          {options
            .filter((c) => c.bucket === bucket)
            .map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
                {c.archivedAt ? ' (archived)' : ''}
              </option>
            ))}
        </optgroup>
      ))}
    </Select>
  );
}
