'use client';

import { useState, type ComponentProps, type ReactNode } from 'react';
import { cn } from '@/lib/cn';
import { Field } from './field';
import { Input } from './input';

type PasswordFieldProps = Omit<ComponentProps<'input'>, 'id' | 'type'> & {
  id: string;
  label: string;
  aside?: ReactNode;
  hint?: string;
  error?: string;
};

export function PasswordField({ id, label, aside, hint, error, className, ...inputProps }: PasswordFieldProps) {
  const [visible, setVisible] = useState(false);

  return (
    <Field id={id} label={label} aside={aside} hint={hint} error={error}>
      {(control) => (
        <div className="relative">
          <Input {...control} {...inputProps} type={visible ? 'text' : 'password'} className={cn('pr-20', className)} />
          <button
            type="button"
            onClick={() => setVisible((v) => !v)}
            aria-label={visible ? 'Hide password' : 'Show password'}
            aria-pressed={visible}
            className="absolute top-1/2 right-1.5 h-9 -translate-y-1/2 rounded-lg px-3 text-caption font-semibold text-accent hover:bg-primary-subtle"
          >
            {visible ? 'Hide' : 'Show'}
          </button>
        </div>
      )}
    </Field>
  );
}
