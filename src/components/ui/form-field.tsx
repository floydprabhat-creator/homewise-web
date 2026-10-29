import type { ComponentProps, ReactNode } from 'react';
import { Field } from './field';
import { Input } from './input';

type FormFieldProps = Omit<ComponentProps<'input'>, 'id'> & {
  id: string;
  label: string;
  aside?: ReactNode;
  hint?: string;
  error?: string;
};

export function FormField({ id, label, aside, hint, error, ...inputProps }: FormFieldProps) {
  return (
    <Field id={id} label={label} aside={aside} hint={hint} error={error}>
      {(control) => <Input {...control} {...inputProps} />}
    </Field>
  );
}
