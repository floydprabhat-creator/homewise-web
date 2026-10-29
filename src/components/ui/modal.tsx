'use client';

import { X } from 'lucide-react';
import { useEffect, useRef, type ReactNode } from 'react';
import { Button } from './button';

type ModalProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  footer?: ReactNode;
};

/** Native <dialog>: focus trapping, Escape and the backdrop come from the browser. */
export function Modal({ open, onClose, title, children, footer }: ModalProps) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onClick={(e) => e.target === ref.current && onClose()}
      aria-labelledby="modal-title"
      className="m-auto w-[calc(100%-2rem)] max-w-md rounded-card border border-border bg-card p-0 text-foreground backdrop:bg-black/50"
    >
      <div className="flex flex-col gap-4 p-6">
        <div className="flex items-start justify-between gap-4">
          <h2 id="modal-title" className="text-section font-bold">
            {title}
          </h2>
          <Button variant="ghost" size="icon" aria-label="Close" onClick={onClose} className="-mt-2 -mr-2 text-muted-foreground">
            <X aria-hidden className="size-5" />
          </Button>
        </div>
        <div className="text-body text-muted-foreground">{children}</div>
        {footer && <div className="flex justify-end gap-3">{footer}</div>}
      </div>
    </dialog>
  );
}

type ConfirmDialogProps = {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  children: ReactNode;
  confirmLabel: string;
  loading?: boolean;
};

export function ConfirmDialog({ open, onClose, onConfirm, title, children, confirmLabel, loading }: ConfirmDialogProps) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="danger" onClick={onConfirm} loading={loading}>
            {confirmLabel}
          </Button>
        </>
      }
    >
      {children}
    </Modal>
  );
}
