'use client';

import { Info } from 'lucide-react';
import { Alert } from '@/components/ui/alert';
import type { Bucket } from '@/types/constants';
import { useBudget } from '../api';
import { previewBucket } from '../usage';

const TONES = { OK: 'brand', TARGET_REACHED: 'success', WARNING: 'warning', EXCEEDED: 'danger' } as const;

type UsagePreviewProps = {
  month: string;
  bucket: Bucket | undefined;
  amount: number;
  /** Subtracted first: the original amount when editing an entry in the same month and bucket. */
  removed?: number;
  /** Text before the preview, e.g. "Adds ₹2,312 to Essentials as Electricity spending." */
  lead?: string;
};

/** "This brings Lifestyle to 92% of its quota", from the cached usage response (no extra request per keystroke). */
export function UsagePreview({ month, bucket, amount, removed = 0, lead }: UsagePreviewProps) {
  const { data } = useBudget(month);
  const preview = bucket ? previewBucket(data?.usage, bucket, amount, removed) : null;
  if (!preview && !lead) return null;

  return (
    <Alert tone={preview ? TONES[preview.state] : 'brand'} icon={Info} className="text-caption">
      {lead}
      {lead && preview && ' '}
      {preview?.text}
    </Alert>
  );
}
