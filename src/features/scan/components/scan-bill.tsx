'use client';

import { Check, CircleAlert, ScanText } from 'lucide-react';
import { useId, useRef, useState } from 'react';
import { Alert } from '@/components/ui/alert';
import { Spinner } from '@/components/ui/spinner';
import { apiErrorMessage } from '@/lib/form-errors';
import type { ScannedBill } from '@/types/api';
import { ALLOWED_FILE_TYPES, MAX_FILE_BYTES } from '@/types/constants';
import { useScanBill, useScanStatus } from '../api';

type ScanBillProps = {
  /** Called with what was read (and the file, so a form can attach it). Only for a readable bill. */
  onScanned: (bill: ScannedBill, file: File) => void;
};

/**
 * "Fill in from a bill": the user picks a photo or PDF, AI reads it and the form fills itself in.
 * Hidden when the API has no AI set up. Nothing is saved until the user saves the form.
 */
export function ScanBill({ onScanned }: ScanBillProps) {
  const id = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const { data: status } = useScanStatus();
  const scan = useScanBill();
  const [message, setMessage] = useState<{ tone: 'success' | 'danger'; text: string } | null>(null);

  if (!status?.enabled) return null;

  function pick(file: File | undefined) {
    if (inputRef.current) inputRef.current.value = '';
    if (!file) return;
    if (file.size > MAX_FILE_BYTES) return setMessage({ tone: 'danger', text: 'The file must be 5 MB or smaller' });
    if (!ALLOWED_FILE_TYPES.includes(file.type)) return setMessage({ tone: 'danger', text: 'Use a JPG, PNG, WebP or PDF file' });

    setMessage(null);
    scan.mutate(file, {
      onSuccess: (bill) => {
        if (!bill.readable) {
          setMessage({ tone: 'danger', text: "This doesn't look like a bill or receipt. Fill in the details yourself." });
          return;
        }
        onScanned(bill, file);
        setMessage({
          tone: 'success',
          text: `Filled in from ${bill.merchant ?? 'your bill'}. Check the details before saving.`,
        });
      },
      onError: (err) => setMessage({ tone: 'danger', text: apiErrorMessage(err) }),
    });
  }

  return (
    <div className="flex flex-col gap-2.5 rounded-control border-[1.5px] border-dashed border-primary-soft p-3.5">
      <div className="flex items-center gap-3">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary-subtle text-accent">
          <ScanText aria-hidden className="size-[18px]" />
        </span>
        <div className="flex min-w-0 flex-1 flex-col">
          <span className="text-caption font-semibold">Fill in from a bill</span>
          <span className="text-xs text-muted-foreground">
            {scan.isPending ? 'Reading your bill… this can take up to a minute.' : 'Upload a photo or PDF and the details fill themselves in.'}
          </span>
        </div>
        <input
          ref={inputRef}
          id={id}
          type="file"
          accept={ALLOWED_FILE_TYPES.join(',')}
          className="sr-only"
          disabled={scan.isPending}
          onChange={(e) => pick(e.target.files?.[0])}
        />
        <label
          htmlFor={id}
          aria-disabled={scan.isPending}
          className="inline-flex h-9 shrink-0 cursor-pointer items-center gap-2 rounded-control px-3 text-caption font-semibold text-accent hover:bg-primary-subtle aria-disabled:cursor-wait aria-disabled:opacity-70"
        >
          {scan.isPending && <Spinner />}
          {scan.isPending ? 'Reading' : 'Choose bill'}
        </label>
      </div>
      {message && (
        <Alert tone={message.tone} icon={message.tone === 'success' ? Check : CircleAlert}>
          {message.text}
        </Alert>
      )}
      <span className="text-[11px] text-muted-foreground">The file is sent to Google Gemini to read it.</span>
    </div>
  );
}
