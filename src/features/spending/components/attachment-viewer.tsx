'use client';

import { FileText, ImageIcon, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { FieldError } from '@/components/ui/field-error';
import { apiErrorMessage } from '@/lib/form-errors';
import { formatBytes } from '@/lib/format';
import type { Attachment } from '@/types/api';
import { useAttachmentUrl, useRemoveAttachment } from '../api';

type AttachmentViewerProps = { attachments: Attachment[]; canRemove: boolean };

/** Each file opens through a 5-minute signed URL fetched on demand: images inline, PDFs in a new tab. */
export function AttachmentViewer({ attachments, canRemove }: AttachmentViewerProps) {
  const getUrl = useAttachmentUrl();
  const remove = useRemoveAttachment();
  const [preview, setPreview] = useState<{ id: string; url: string; name: string } | null>(null);
  const [error, setError] = useState<string>();

  function open(file: Attachment) {
    setError(undefined);
    const isPdf = file.contentType === 'application/pdf';
    // Open the tab during the click so pop-up blockers allow it, then point it at the signed URL.
    const tab = isPdf ? window.open('', '_blank') : null;
    getUrl.mutate(file.id, {
      onSuccess: ({ url }) => {
        if (tab) tab.location.href = url;
        else setPreview({ id: file.id, url, name: file.originalName });
      },
      onError: (e) => {
        tab?.close();
        setError(apiErrorMessage(e));
      },
    });
  }

  return (
    <div className="flex flex-col gap-2">
      {attachments.map((file) => {
        const isPdf = file.contentType === 'application/pdf';
        return (
          <div key={file.id} className="flex flex-col gap-2">
            <div className="flex items-center gap-2.5 rounded-control border-[1.5px] border-border px-3 py-2.5">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary-subtle text-accent">
                {isPdf ? <FileText aria-hidden className="size-[18px]" /> : <ImageIcon aria-hidden className="size-[18px]" />}
              </span>
              <span className="flex min-w-0 flex-1 flex-col">
                <span className="truncate text-caption font-semibold">{file.originalName}</span>
                <span className="text-xs text-muted-foreground">{formatBytes(file.sizeBytes)}</span>
              </span>
              <Button
                variant="ghost"
                size="sm"
                loading={getUrl.isPending && getUrl.variables === file.id}
                onClick={() => (preview?.id === file.id ? setPreview(null) : open(file))}
              >
                {preview?.id === file.id ? 'Hide' : 'View'}
              </Button>
              {canRemove && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-9 text-muted-foreground"
                  aria-label={`Remove ${file.originalName}`}
                  loading={remove.isPending && remove.variables === file.id}
                  onClick={() =>
                    remove.mutate(file.id, {
                      onSuccess: () => preview?.id === file.id && setPreview(null),
                      onError: (e) => setError(apiErrorMessage(e)),
                    })
                  }
                >
                  {!(remove.isPending && remove.variables === file.id) && <Trash2 aria-hidden className="size-4" />}
                </Button>
              )}
            </div>
            {preview?.id === file.id && (
              // eslint-disable-next-line @next/next/no-img-element -- short-lived signed URL; next/image would cache it
              <img src={preview.url} alt={preview.name} className="max-h-96 w-full rounded-control border border-border object-contain" />
            )}
          </div>
        );
      })}
      <FieldError message={error} />
    </div>
  );
}
