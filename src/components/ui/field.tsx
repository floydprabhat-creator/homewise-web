import type { ReactNode } from 'react';
import { FieldError } from './field-error';
import { Label } from './label';

type FieldControlProps = {
  id: string;
  'aria-invalid'?: true;
  'aria-describedby'?: string;
};

type FieldProps = {
  id: string;
  label: string;
  /** Small muted text at the right end of the label row, e.g. "At least 8 characters". */
  aside?: ReactNode;
  hint?: string;
  error?: string;
  /** Renders the control with the id and aria attributes wired up. */
  children: (control: FieldControlProps) => ReactNode;
};

/** Label row + control + hint / error. Use FormField or PasswordField for the common cases. */
export function Field({ id, label, aside, hint, error, children }: FieldProps) {
  const errorId = `${id}-error`;
  const hintId = `${id}-hint`;

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-baseline justify-between gap-2">
        <Label htmlFor={id}>{label}</Label>
        {aside && <span className="text-xs text-muted-foreground">{aside}</span>}
      </div>
      {children({
        id,
        'aria-invalid': error ? true : undefined,
        'aria-describedby': error ? errorId : hint ? hintId : undefined,
      })}
      {error ? (
        <FieldError id={errorId} message={error} />
      ) : (
        hint && (
          <p id={hintId} className="text-xs text-muted-foreground">
            {hint}
          </p>
        )
      )}
    </div>
  );
}
