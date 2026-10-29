'use client';

import { Pencil, ReceiptText, Trash2, TriangleAlert } from 'lucide-react';
import { useState } from 'react';
import { Alert } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { FilePicker } from '@/components/ui/file-picker';
import { ConfirmDialog } from '@/components/ui/modal';
import { Spinner } from '@/components/ui/spinner';
import { useMe } from '@/features/auth/api';
import { cn } from '@/lib/cn';
import { apiErrorMessage } from '@/lib/form-errors';
import { formatINR, formatLongDate } from '@/lib/format';
import type { FailedFile } from '@/types/api';
import { BUCKET_INFO, MAX_FILES_PER_ENTRY } from '@/types/constants';
import { useAddAttachments, useDeleteSpending, useSpendingEntry } from '../api';
import { AttachmentViewer } from './attachment-viewer';

type EntryDetailProps = {
  id: string;
  failedFiles?: FailedFile[];
  onEdit: () => void;
  onDeleted: () => void;
};

export function EntryDetail({ id, failedFiles = [], onEdit, onDeleted }: EntryDetailProps) {
  const { data: session } = useMe();
  const { data: entry, error } = useSpendingEntry(id);
  const remove = useDeleteSpending();
  const addFiles = useAddAttachments();
  const [confirming, setConfirming] = useState(false);
  const [newFiles, setNewFiles] = useState<File[]>([]);
  const [filesError, setFilesError] = useState<string>();

  if (error) return <Alert>{apiErrorMessage(error)}</Alert>;
  if (!entry || !session) {
    return (
      <div className="flex justify-center py-10 text-accent">
        <Spinner className="size-6" />
      </div>
    );
  }

  // Mirrors the API: the recorder or the head may change an entry; bill payments only through the bill.
  const canModify = (session.role === 'HEAD' || entry.recordedBy.id === session.user.id) && !entry.isBillPayment;
  const slotsLeft = MAX_FILES_PER_ENTRY - entry.attachments.length;

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-1">
        <span className="text-figure font-extrabold tracking-tight">{formatINR(entry.amount)}</span>
        <span className="text-body font-semibold">{entry.note ?? entry.category.name}</span>
        <span className="flex flex-wrap items-center gap-1.5 text-caption text-muted-foreground">
          <span aria-hidden className={cn('size-2 rounded-full', BUCKET_INFO[entry.category.bucket].dot)} />
          {entry.category.name} · {BUCKET_INFO[entry.category.bucket].label}
        </span>
      </div>

      <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-2 text-body">
        <dt className="text-muted-foreground">Date</dt>
        <dd>{formatLongDate(entry.date)}</dd>
        <dt className="text-muted-foreground">Recorded by</dt>
        <dd>
          {entry.recordedBy.name}
          {entry.recordedBy.isFormerMember && <span className="text-muted-foreground"> (former member)</span>}
        </dd>
      </dl>

      {entry.isBillPayment && (
        <Alert tone="brand" icon={ReceiptText}>
          This entry was created by paying a bill. Change or undo it from the bill.
        </Alert>
      )}

      {failedFiles.length > 0 && (
        <Alert tone="warning" icon={TriangleAlert}>
          The entry was saved, but {failedFiles.map((f) => f.name).join(', ')} didn&apos;t upload. Add {failedFiles.length === 1 ? 'it' : 'them'} again below.
        </Alert>
      )}

      <div className="flex flex-col gap-2">
        <span className="text-caption font-semibold">Bill photos and PDFs</span>
        {entry.attachments.length > 0 ? (
          <AttachmentViewer attachments={entry.attachments} canRemove={canModify} />
        ) : (
          <p className="text-caption text-muted-foreground">No files attached.</p>
        )}
        {canModify && slotsLeft > 0 && (
          <>
            <FilePicker
              label="Add files"
              files={newFiles}
              onChange={(f) => {
                setNewFiles(f);
                setFilesError(undefined);
              }}
              max={slotsLeft}
              error={filesError}
              onError={setFilesError}
            />
            {newFiles.length > 0 && (
              <Button
                variant="outline"
                loading={addFiles.isPending}
                onClick={() =>
                  addFiles.mutate(
                    { id, files: newFiles },
                    {
                      onSuccess: ({ failedFiles: failed }) => {
                        setNewFiles([]);
                        if (failed.length) setFilesError(`${failed.map((f) => f.name).join(', ')} didn't upload. Try again.`);
                      },
                      onError: (e) => setFilesError(apiErrorMessage(e)),
                    },
                  )
                }
              >
                Upload {newFiles.length} {newFiles.length === 1 ? 'file' : 'files'}
              </Button>
            )}
          </>
        )}
      </div>

      {canModify && (
        <div className="flex gap-2.5 border-t border-border pt-5">
          <Button variant="secondary" className="flex-1" onClick={onEdit}>
            <Pencil aria-hidden className="size-4" />
            Edit
          </Button>
          <Button variant="ghost" className="flex-1 text-danger hover:bg-danger-subtle" onClick={() => setConfirming(true)}>
            <Trash2 aria-hidden className="size-4" />
            Delete
          </Button>
        </div>
      )}

      <ConfirmDialog
        open={confirming}
        onClose={() => setConfirming(false)}
        title="Delete this entry?"
        confirmLabel="Delete entry"
        loading={remove.isPending}
        onConfirm={() =>
          remove.mutate(id, {
            onSuccess: () => {
              setConfirming(false);
              onDeleted();
            },
          })
        }
      >
        {formatINR(entry.amount)} for {entry.note ?? entry.category.name} and its files will be removed. This can&apos;t be undone.
        {remove.isError && <span className="mt-2 block text-danger">{apiErrorMessage(remove.error)}</span>}
      </ConfirmDialog>
    </div>
  );
}
