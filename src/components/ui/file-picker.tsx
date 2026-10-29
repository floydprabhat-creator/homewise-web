'use client';

import { FileText, ImageIcon, X } from 'lucide-react';
import { useId, useRef } from 'react';
import { formatBytes } from '@/lib/format';
import { ALLOWED_FILE_TYPES, MAX_FILE_BYTES } from '@/types/constants';
import { FieldError } from './field-error';

type FilePickerProps = {
  label: string;
  files: File[];
  onChange: (files: File[]) => void;
  /** How many more files may be added (the API allows 3 per entry). */
  max: number;
  error?: string;
  onError?: (message: string | undefined) => void;
};

/** Checks count, size and type on the client for instant feedback; the API checks the bytes again. */
export function FilePicker({ label, files, onChange, max, error, onError }: FilePickerProps) {
  const id = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const left = max - files.length;

  function add(picked: FileList | null) {
    if (!picked) return;
    const incoming = Array.from(picked);
    const problem =
      incoming.length > left
        ? `You can add ${left} more file${left === 1 ? '' : 's'}`
        : incoming.find((f) => f.size > MAX_FILE_BYTES)
          ? 'Each file must be 5 MB or smaller'
          : incoming.find((f) => !ALLOWED_FILE_TYPES.includes(f.type))
            ? 'Use JPG, PNG, WebP or PDF files'
            : undefined;
    onError?.(problem);
    if (!problem) onChange([...files, ...incoming]);
    if (inputRef.current) inputRef.current.value = '';
  }

  return (
    <div className="flex flex-col gap-2">
      <span id={`${id}-label`} className="text-caption font-semibold text-foreground">
        {label}
      </span>

      {files.map((file, i) => (
        <div key={`${file.name}-${i}`} className="flex items-center gap-2.5 rounded-control border-[1.5px] border-border px-3 py-2.5">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary-subtle text-accent">
            {file.type === 'application/pdf' ? <FileText aria-hidden className="size-[18px]" /> : <ImageIcon aria-hidden className="size-[18px]" />}
          </span>
          <span className="flex min-w-0 flex-1 flex-col">
            <span className="truncate text-caption font-semibold">{file.name}</span>
            <span className="text-xs text-muted-foreground">{formatBytes(file.size)}</span>
          </span>
          <button
            type="button"
            aria-label={`Remove ${file.name}`}
            onClick={() => onChange(files.filter((_, j) => j !== i))}
            className="flex size-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-neutral"
          >
            <X aria-hidden className="size-4" />
          </button>
        </div>
      ))}

      {left > 0 && (
        <>
          <input
            ref={inputRef}
            id={id}
            type="file"
            multiple
            accept={ALLOWED_FILE_TYPES.join(',')}
            aria-labelledby={`${id}-label`}
            className="sr-only"
            onChange={(e) => add(e.target.files)}
          />
          <label
            htmlFor={id}
            className="flex h-11 cursor-pointer items-center justify-center rounded-control border-[1.5px] border-dashed border-primary-soft text-caption font-semibold text-accent hover:bg-primary-subtle"
          >
            {files.length === 0 ? 'Attach bill photo or PDF' : `Add another file · ${left} left`}
          </label>
        </>
      )}
      <span className="text-xs text-muted-foreground">JPG, PNG, WebP or PDF, up to 5 MB each</span>
      <FieldError message={error} />
    </div>
  );
}
