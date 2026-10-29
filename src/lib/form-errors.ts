import type { FieldValues, Path, UseFormSetError } from 'react-hook-form';
import { ApiError } from './api-client';

/**
 * Shows API field errors under the matching inputs and returns a message for the whole form,
 * or null when every error was attached to a field.
 */
export function applyApiErrors<T extends FieldValues>(
  error: unknown,
  setError: UseFormSetError<T>,
  fieldNames: readonly Path<T>[],
): string | null {
  if (!(error instanceof ApiError)) return 'Something went wrong. Please try again.';

  let attached = false;
  for (const [field, message] of Object.entries(error.fields)) {
    if ((fieldNames as readonly string[]).includes(field)) {
      setError(field as Path<T>, { type: 'server', message });
      attached = true;
    }
  }

  return attached ? null : error.message;
}

/** The message to show for a failed request that isn't tied to a form field. */
export function apiErrorMessage(error: unknown): string {
  return error instanceof ApiError ? error.message : 'Something went wrong. Please try again.';
}
